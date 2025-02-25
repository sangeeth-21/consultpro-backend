import { Hono } from "hono";
import { PaymentSchema } from "../validations/payment"; // Import the updated schema
import { initializeDb } from "../db";
import { bookings } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../utils/jwt";

// Define the Razorpay API response types
interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: string[];
  created_at: number;
}

interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: string[];
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}

export const paymentRoutes = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string; RAZORPAY_KEY_ID: string; RAZORPAY_KEY_SECRET: string } }>();

// Generate a shorter order ID
const generateOrderId = (bookingUid: string) => {
  const uuidWithoutDashes = bookingUid.replace(/-/g, ""); // Remove dashes from UUID
  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp
  const orderId = `order_${uuidWithoutDashes}_${timestamp}`; // Combine UUID and timestamp

  // Ensure the receipt is no longer than 40 characters
  return orderId.slice(0, 40);
};

// Create Razorpay Order and Capture Payment
paymentRoutes.post("/payment-create", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: "Invalid token" }, 401);

  const body = await c.req.json();
  const { bookingUid, amount, paymentMethod } = PaymentSchema.parse(body); // Include paymentMethod

  const db = initializeDb(c.env.DB);

  // Fetch the booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.uid, bookingUid))
    .limit(1);

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  try {
    // Generate a shorter order ID
    const orderId = generateOrderId(bookingUid);

    // Step 1: Create a Razorpay order
    const razorpayOrderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: orderId,
        notes: {
          bookingUid: bookingUid,
          customerEmail: booking.email,
        },
      }),
    });

    if (!razorpayOrderResponse.ok) {
      const errorResponse = await razorpayOrderResponse.json();
      console.error("Razorpay Order API Error:", errorResponse);
      return c.json({ error: "Order creation failed", details: errorResponse }, 400);
    }

    const razorpayOrder = await razorpayOrderResponse.json() as RazorpayOrderResponse;

    // Step 2: Capture the payment using the order ID
    const razorpayPaymentResponse = await fetch("https://api.razorpay.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Amount in paise
        currency: "INR",
        order_id: razorpayOrder.id,
        method: paymentMethod, // Use the provided payment method
        email: booking.email,
        contact: "9999999999", // Replace with actual contact number
        notes: {
          bookingUid: bookingUid,
        },
      }),
    });

    if (!razorpayPaymentResponse.ok) {
      const errorResponse = await razorpayPaymentResponse.json();
      console.error("Razorpay Payment API Error:", errorResponse);
      return c.json({ error: "Payment capture failed", details: errorResponse }, 400);
    }

    const razorpayPayment = await razorpayPaymentResponse.json() as RazorpayPaymentResponse;

    // Log the full response for debugging
    console.log("Razorpay Payment API Response:", razorpayPayment);

    // Update booking payment status
    await db
      .update(bookings)
      .set({
        paymentStatus: razorpayPayment.status, // Set to the payment status returned by Razorpay
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.uid, bookingUid));

    // Return the payment ID
    return c.json({
      message: "Payment created and captured successfully",
      paymentId: razorpayPayment.id,
      paymentStatus: razorpayPayment.status,
    });
  } catch (err) {
    console.error("Payment processing error:", err);
    return c.json({ error: "Payment processing failed" }, 500);
  }
});