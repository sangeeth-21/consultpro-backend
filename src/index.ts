import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { bookingRoutes } from "./routes/bookings";
import { paymentRoutes } from "./routes/payment";
import { meetApp } from "./routes/meet"; // Import Zoho Meet routes

// Initialize the Hono app
const app = new Hono();

// Register routes
app.route("/auth", authRoutes); // Authentication routes
app.route("/users", userRoutes); // User-related routes
app.route("/bookings", bookingRoutes); // Booking-related routes
app.route("/payments", paymentRoutes); // Payment-related routes
app.route("/zoho-meet", meetApp); // Zoho Meet-related routes

// Root endpoint
app.get("/", (c) => {
  return c.json({ message: "Welcome to the API!" });
});

// Export the app
export default app;