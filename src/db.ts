import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  uid: integer("uid").primaryKey().notNull(), // Remove .default() for auto-increment
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});
