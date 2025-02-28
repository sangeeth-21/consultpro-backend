import { Hono } from "hono";
import { cors } from "hono/cors";
import { SignupSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../validations/user";
import { generateToken } from "../utils/jwt";
import { initializeDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authRoutes = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string } }>();

authRoutes.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//  Signup Route (Register User)
authRoutes.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    
    //  Ensure `name` is included in validation
    const { name, email, password } = SignupSchema.parse(body);

    console.log("Received Signup Data:", body);

    const db = initializeDb(c.env.DB);

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: "User already exists" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        uuid: crypto.randomUUID(),
        name, //  Now recognized properly
        email,
        password: hashedPassword,
      })
      .returning();

    console.log("New User Inserted:", newUser);

    return c.json({
      message: "User registered successfully",
      user: {
        uuid: newUser.uuid,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return c.json({ error: "Invalid data or server error" }, 400);
  }
});

//  Login Route (Authenticate User)
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = LoginSchema.parse(body);

    const db = initializeDb(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await generateToken({ uuid: user.uuid, role: user.role, name: user.name }, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        uuid: user.uuid,
        name: user.name, //  Now included in response
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return c.json({ error: "Invalid data or server error" }, 400);
  }
});

//  Forgot Password Route - Send OTP (Default OTP: 123456)
authRoutes.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    const db = initializeDb(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Simulate sending OTP (Default OTP: 123456)
    console.log(`OTP sent to ${email}: 123456`);

    return c.json({ message: "OTP sent successfully", email });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return c.json({ error: "Invalid request" }, 400);
  }
});

//  Reset Password Route (Verify OTP & Change Password)
authRoutes.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, otp, newPassword } = ResetPasswordSchema.parse(body);

    // Check if OTP is correct (Default: 123456)
    if (otp !== "123456") {
      return c.json({ error: "Invalid OTP" }, 400);
    }

    const db = initializeDb(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

    return c.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return c.json({ error: "Invalid request" }, 400);
  }
});