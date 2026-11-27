import {
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  date,
  unique,
  uniqueIndex,
  check 
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";
import { sql } from "drizzle-orm";

export const role = pgEnum("user_role_enum", [
  "ADMIN",
  "FIELD_MANAGER",
  "OPERATOR",
]);

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

export const supplyCategoryEnum = pgEnum("supply_category_enum", [
  "SEED",
  "FERTILIZER",
  "CROP_PROTECTION" // defensivo
])

export const stockMovementTypeEnum = pgEnum("stock_movement_type_enum", [
  "PURCHASE_IN", // entrada compra
  "FIELD_APPLICATION_OUT", // saída manejo
  "INVENTORY_ADJUSTMENT", // ajuste inventário
  "LOSS_DISPOSAL" // perda descarte
])

export const supplyUnitEnum = pgEnum("supply_unit_enum", [
  "kg",
  "L",
  "un"
])

export const userTable = pgTable("users", {
  id: uuid().$defaultFn(v7).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  role: role().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

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
  current_hour_meter: numeric({ precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
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
  harvest_id: uuid().references(() => harvestsTable.id, {
    onDelete: "set null",
  }),
  type: financialEntryTypeEnum().notNull(),
  category: varchar({ length: 100 }).notNull(),
  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  entry_date: timestamp().notNull().defaultNow(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const suppliesTable = pgTable("supplies", {
  id: uuid().$defaultFn(v7).primaryKey(),
  name: varchar({ length: 150 }).notNull(),
  category: supplyCategoryEnum().notNull(),
  unit: supplyUnitEnum().notNull(),
  min_stock: numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  average_cost: numeric({ precision: 14, scale: 4 }).notNull().default("0.00"),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}, (t) => [
  uniqueIndex("supplies_category_name_unique").on(t.category, sql`lower(${t.name})`)
])

export const supplyLotsTable = pgTable("supply_lots", {
  id: uuid().$defaultFn(v7).primaryKey(),
  supply_id: uuid()
    .notNull()  
    .references(() => suppliesTable.id, { onDelete: "restrict" }),
  lot_number: varchar({ length: 50 }),
  expiry_date: date(),
  balance: numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}, (t) => [
  unique().on(t.supply_id, t.lot_number).nullsNotDistinct(),
  check("balance_non_negative", sql`${t.balance} >= 0`)
])

export const stockMovementsTable = pgTable("stock_movements", {
  id: uuid().$defaultFn(v7).primaryKey(),
  lot_id: uuid()
    .notNull()
    .references(() => supplyLotsTable.id, { onDelete: "restrict" }),
  user_id: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),
  type: stockMovementTypeEnum().notNull(),
  quantity: numeric({ precision: 10, scale: 2 }).notNull(),
  resulting_balance: numeric({ precision: 10, scale: 2 }).notNull(),
  unit_cost: numeric({ precision: 14, scale: 4 }).notNull(),
  movement_date: date().notNull().defaultNow(),
  created_at: timestamp().notNull().defaultNow(),
  reason: varchar({ length: 255 }),
  harvest_id: uuid().references(() => harvestsTable.id, { onDelete: "restrict" }),
  //field_activity_id: 
})