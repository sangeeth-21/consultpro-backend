import { z } from "zod";

//  Updated Signup Schema to include name
export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"), // Name is now required
  email: z.string().email(),
  password: z.string().min(6),
});

//  Updated Login Schema (No change, just for reference)
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

//  Forgot Password Schema (Only requires email)
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

//  Reset Password Schema (Requires OTP & new password)
export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"), // OTP validation
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

//  Updated User Update Schema (No major change)
export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneno: z.string().optional(),
});

//  Create Booking Schema (No major change)
export const CreateBookingSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  calendarDate: z.string(),
  fileurl: z.string().optional(),
});

//  Update Booking Schema (No major change)
export const UpdateBookingSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
});
