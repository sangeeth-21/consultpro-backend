import { Hono } from "hono";
import { authRoutes } from "./auth";
import { userRoutes } from "./users";
import { bookingRoutes } from "./bookings";
import { paymentRoutes } from "./payment";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/bookings", bookingRoutes);
app.route("/payments", paymentRoutes); // Register payment routes

export default app;