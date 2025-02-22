import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { users } from "./db";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Signup
app.post("/signup", async (c) => {
  const body = await c.req.json();
  const { email, password, role = "user" } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = drizzle(c.env.DB);

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString(), // Use CURRENT_TIMESTAMP format
      })
      .returning();

    const token = await sign(
      { uid: newUser.uid, role: newUser.role },
      c.env.JWT_SECRET,
      "HS256"
    );

    return c.json({ message: "User registered successfully", token });
  } catch (err) {
    return c.json({ error: "User already exists or invalid data" }, 400);
  }
});

// Login
app.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const db = drizzle(c.env.DB);
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user.length || !(await bcrypt.compare(password, user[0].password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await sign({ uid: user[0].uid, role: user[0].role }, c.env.JWT_SECRET, "HS256");
  return c.json({ token });
});

export default app;
