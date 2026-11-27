import { db, Executor } from "./db";
import { desc, eq, ilike, and, sql, DrizzleQueryError } from "drizzle-orm";

import * as schema from "./schema";
import { UserDatabaseRow } from "@/modules/users/user.entity";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";
import { ServiceOrderDatabaseRow } from "@/modules/service-orders/service-order.entity";
import { CloseServiceOrderDTO } from "@/modules/service-orders/close-service-order.dto";
import { FinancialEntryDatabaseRow } from "@/modules/financial/financial-entry.entity";
import { CreateFinancialEntryDTO } from "@/modules/financial/financial-entry.dto";
import { SupplyCategory } from "./schema";
import { CreateSupplyInput, SupplyItem, toSupplyItem, UpdateSupplyInput } from "@/modules/supplies/supply";

export async function createUser(
  user: RegisterUserDTO,
  password_hash: string,
): Promise<UserDatabaseRow> {
  return (
    await db
      .insert(schema.userTable)
      .values({
        name: user.name,
        email: user.email,
        role: user.role,
        password_hash,
      })
      .returning()
  )[0];
}

export async function getUserByEmail(email: string): Promise<UserDatabaseRow> {
  return (
    await db
      .select()
      .from(schema.userTable)
      .where(eq(schema.userTable.email, email))
  )[0];
}

export async function closeServiceOrder(
  osId: string,
  dto: CloseServiceOrderDTO,
): Promise<ServiceOrderDatabaseRow> {
  return await db.transaction(async (tx) => {
    const existingOs = (
      await tx
        .select()
        .from(schema.serviceOrdersTable)
        .where(eq(schema.serviceOrdersTable.id, osId))
    )[0];

    if (!existingOs) throw new Error("NOT_FOUND");
    if (existingOs.status === "COMPLETED") throw new Error("ALREADY_COMPLETED");

    const updatedOs = (
      await tx
        .update(schema.serviceOrdersTable)
        .set({
          parts_cost: dto.parts_cost.toFixed(2),
          labor_cost: dto.labor_cost.toFixed(2),
          status: "COMPLETED",
          updated_at: new Date(),
        })
        .where(eq(schema.serviceOrdersTable.id, osId))
        .returning()
    )[0];

    const equipment = (
      await tx
        .update(schema.equipmentsTable)
        .set({
          status: "AVAILABLE",
          updated_at: new Date(),
        })
        .where(eq(schema.equipmentsTable.id, existingOs.equipment_id))
        .returning()
    )[0];

    const totalCost = dto.parts_cost + dto.labor_cost;

    await tx.insert(schema.financialEntriesTable).values({
      property_id: equipment.property_id,
      harvest_id: dto.harvest_id ?? null,
      type: "EXPENSE",
      category: "Mecanização / Frota",
      amount: totalCost.toFixed(2),
      entry_date: new Date(),
    });

    return updatedOs;
  });
}

export async function listFinancialEntries(): Promise<
  FinancialEntryDatabaseRow[]
> {
  return await db
    .select()
    .from(schema.financialEntriesTable)
    .orderBy(desc(schema.financialEntriesTable.entry_date));
}

export async function createFinancialEntry(
  dto: CreateFinancialEntryDTO,
): Promise<FinancialEntryDatabaseRow> {
  return (
    await db
      .insert(schema.financialEntriesTable)
      .values({
        property_id: dto.property_id,
        harvest_id: dto.harvest_id,
        type: dto.type,
        category: dto.category,
        amount: dto.amount.toFixed(2),
        entry_date: dto.entry_date,
      })
      .returning()
  )[0];
}

export async function updateFinancialEntry(
  id: string,
  data: Partial<{
    property_id: string;
    harvest_id: string | null;
    type: "INCOME" | "EXPENSE";
    category: string;
    amount: number;
    entry_date: Date;
  }>,
): Promise<FinancialEntryDatabaseRow | undefined> {
  return (
    await db
      .update(schema.financialEntriesTable)
      .set({
        property_id: data.property_id,
        harvest_id: data.harvest_id,
        type: data.type,
        category: data.category,
        amount: data.amount !== undefined ? data.amount.toFixed(2) : undefined,
        entry_date: data.entry_date,
        updated_at: new Date(),
      })
      .where(eq(schema.financialEntriesTable.id, id))
      .returning()
  )[0];
}

export async function deleteFinancialEntry(id: string): Promise<boolean> {
  const deleted = await db
    .delete(schema.financialEntriesTable)
    .where(eq(schema.financialEntriesTable.id, id))
    .returning();
  return deleted.length > 0;
}

export type ListSupplyFilters = {
  search?: string;
  category?: SupplyCategory;
  includeInactive?: boolean;
}

export async function supplyHasMovements(exec: Executor, supplyId: string): Promise<boolean> {
  const [movement] = await exec
    .select({ id: schema.stockMovementsTable.id })
    .from(schema.stockMovementsTable)
    .innerJoin(schema.supplyLotsTable, eq(schema.supplyLotsTable.id, schema.stockMovementsTable.lot_id))
    .where(eq(schema.supplyLotsTable.supply_id, supplyId))
    .limit(1);
  return movement !== undefined;
}

export type UpdateSupplyErrorCode = "NOT_FOUND" | "SUPPLY_LOCKED" | "DUPLICATE";

export class UpdateSupplyError extends Error {
  constructor(readonly code: UpdateSupplyErrorCode) {
    super(code);
  }
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof DrizzleQueryError && (err.cause as { code?: string } | undefined)?.code === "23505";
}

export async function updateSupply(id: string, changes: UpdateSupplyInput): Promise<{ ok: true, value: SupplyItem } | { ok: false, code: UpdateSupplyErrorCode }> {
  try {
    const value = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(schema.suppliesTable)
      .where(eq(schema.suppliesTable.id, id)).for("update");
    if (!current) throw new UpdateSupplyError("NOT_FOUND");
    const changesLocked =
      (changes.unit !== undefined && changes.unit !== current.unit) ||
      (changes.category !== undefined && changes.category !== current.category);
    if (changesLocked && (await supplyHasMovements(tx, id))) throw new UpdateSupplyError("SUPPLY_LOCKED");
    const [updated] = await tx.update(schema.suppliesTable)
      .set({
        name: changes.name,
        category: changes.category,
        unit: changes.unit,
        min_stock: changes.min_stock,
        active: changes.active,
        updated_at: new Date(),
      })
      .where(eq(schema.suppliesTable.id, id))
      .returning();
    return toSupplyItem(updated, await getSupplyBalance(tx, id));
    });

    return { ok: true, value }
  } catch (err) {
    if (err instanceof UpdateSupplyError) return { ok: false, code: err.code };
    if (isUniqueViolation(err)) return { ok: false, code: "DUPLICATE" };
    throw err;

  }
}



const lotBalanceSum = sql<number>`coalesce(sum(${schema.supplyLotsTable.balance}), 0)`.mapWith(Number);

export async function listSupplies(filters: ListSupplyFilters): Promise<SupplyItem[]> {
  const rows = await db
    .select({ supply: schema.suppliesTable, balance: lotBalanceSum })
    .from(schema.suppliesTable)
    .leftJoin(schema.supplyLotsTable, eq(schema.supplyLotsTable.supply_id, schema.suppliesTable.id))
    .where(
      and(
        filters.includeInactive ? undefined : eq(schema.suppliesTable.active, true),
        filters.search ? ilike(schema.suppliesTable.name, `%${filters.search}%`) : undefined,
        filters.category ? eq(schema.suppliesTable.category, filters.category) : undefined,
      ),
    )
    .groupBy(schema.suppliesTable.id)
    .orderBy(schema.suppliesTable.name);
  return rows.map((row) => toSupplyItem(row.supply, row.balance));
}

export async function getSupplyBalance(exec: Executor, supplyId: string): Promise<number> {
  const [row] = await exec
    .select({ balance: lotBalanceSum })
    .from(schema.supplyLotsTable)
    .where(eq(schema.supplyLotsTable.supply_id, supplyId));
  return row.balance;
}




export type CreateSupplyErrorCode = "DUPLICATE";

export async function createSupply(
  input: CreateSupplyInput,
): Promise<{ ok: true; value: SupplyItem } | { ok: false; code: CreateSupplyErrorCode }> {
  try {
    const [created] = await db
      .insert(schema.suppliesTable)
      .values({
        name: input.name,
        category: input.category,
        unit: input.unit,
        min_stock: input.min_stock,
      })
      .returning();
    return { ok: true, value: toSupplyItem(created, 0) };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, code: "DUPLICATE" };
    throw err;
  }
}