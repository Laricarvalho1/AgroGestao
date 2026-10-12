import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const role = pgEnum("user_role_enum", [
  "ADMIN",
  "FIELD_MANAGER",
  "OPERATOR",
]);

export const userTable = pgTable("users", {
  id: uuid().$defaultFn(v7).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  role: role().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
