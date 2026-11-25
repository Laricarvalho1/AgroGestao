import { numeric, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
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

export const equipmentStatusEnum = pgEnum("equipment_status_enum", [
  "AVAILABLE",
  "UNAVAILABLE",
]);

export const serviceOrderStatusEnum = pgEnum("service_order_status_enum", [
  "OPEN",
  "IN_MAINTENANCE",
  "COMPLETED",
]);

export const financialEntryTypeEnum = pgEnum("financial_entry_type_enum", [
  "INCOME",
  "EXPENSE",
]);

export const propertiesTable = pgTable("properties", {
  id: uuid().$defaultFn(v7).primaryKey(),
  name: varchar({ length: 150 }).notNull(),
  location: varchar({ length: 255 }),
  total_area_hectares: numeric({ precision: 10, scale: 2 }).notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const harvestsTable = pgTable("harvests", {
  id: uuid().$defaultFn(v7).primaryKey(),
  plot_id: uuid().notNull(),
  crop_id: uuid().notNull(),
  start_date: timestamp().notNull(),
  end_date: timestamp(),
  expected_yield: numeric({ precision: 10, scale: 2 }),
  status: varchar({ length: 30 }).notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const equipmentsTable = pgTable("equipments", {
  id: uuid().$defaultFn(v7).primaryKey(),
  property_id: uuid()
    .notNull()
    .references(() => propertiesTable.id, { onDelete: "restrict" }),
  identification: varchar({ length: 100 }).notNull(),
  current_hour_meter: numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  status: equipmentStatusEnum().notNull().default("AVAILABLE"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const serviceOrdersTable = pgTable("service_orders", {
  id: uuid().$defaultFn(v7).primaryKey(),
  equipment_id: uuid()
    .notNull()
    .references(() => equipmentsTable.id, { onDelete: "restrict" }),
  parts_cost: numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  labor_cost: numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  status: serviceOrderStatusEnum().notNull().default("OPEN"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const financialEntriesTable = pgTable("financial_entries", {
  id: uuid().$defaultFn(v7).primaryKey(),
  property_id: uuid()
    .notNull()
    .references(() => propertiesTable.id, { onDelete: "restrict" }),
  harvest_id: uuid().references(() => harvestsTable.id, { onDelete: "set null" }),
  type: financialEntryTypeEnum().notNull(),
  category: varchar({ length: 100 }).notNull(),
  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  entry_date: timestamp().notNull().defaultNow(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
