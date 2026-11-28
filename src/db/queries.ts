import { db } from "./db";
import { desc, eq } from "drizzle-orm";

import * as schema from "./schema";
import { UserDatabaseRow } from "@/modules/users/user.entity";
import { RegisterUserDTO } from "@/modules/users/register-user.dto";
import { ServiceOrderDatabaseRow } from "@/modules/service-orders/service-order.entity";
import { CloseServiceOrderDTO } from "@/modules/service-orders/close-service-order.dto";
import { FinancialEntryDatabaseRow } from "@/modules/financial/financial-entry.entity";
import { CreateFinancialEntryDTO } from "@/modules/financial/financial-entry.dto";
import { CreateHarvestRecordDTO } from "@/modules/harvest-records/create-harvest-record.dto";

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

// 1-Registrar Apontamento de Colheita e calcular rendimento (UC07)
export async function createHarvestRecord(dto: CreateHarvestRecordDTO) {
  return await db.transaction(async (tx) => {
    // Busca a safra para validar se está em andamento
    const harvest = (
      await tx
        .select()
        .from(schema.harvestsTable)
        .where(eq(schema.harvestsTable.id, dto.harvest_id))
    )[0];

    if (!harvest) throw new Error("HARVEST_NOT_FOUND");
    if (harvest.status !== "Em Andamento" && harvest.status !== "IN_PROGRESS") {
      throw new Error("HARVEST_NOT_ACTIVE");
    }

    // Insere o novo apontamento de colheita
    const newRecord = (
      await tx
        .insert(schema.harvestRecordsTable)
        .values({
          harvest_id: dto.harvest_id,
          volume_harvested: dto.volume_harvested.toFixed(2),
          unit: dto.unit,
          weighing_ticket: dto.weighing_ticket,
          storage_destination: dto.storage_destination,
          harvest_date: dto.harvest_date ?? new Date(),
        })
        .returning()
    )[0];

    //busca todos os apontamentos daquela safra para calcular o acumulado
    const allRecords = await tx
      .select()
      .from(schema.harvestRecordsTable)
      .where(eq(schema.harvestRecordsTable.harvest_id, dto.harvest_id));

    const totalHarvested = allRecords.reduce(
      (acc, item) => acc + Number(item.volume_harvested),
      0
    );

    return {
      record: newRecord,
      accumulated_volume: totalHarvested,
    };
  });
}

// 2-Listar lançamentos financeiros filtrados para o DRE (UC12)
export async function getFinancialEntriesForDRE(filters: {
  property_id: string;
  harvest_id?: string;
  start_date?: Date;
  end_date?: Date;
}) {
  const entries = await db
    .select()
    .from(schema.financialEntriesTable)
    .where(eq(schema.financialEntriesTable.property_id, filters.property_id))
    .orderBy(desc(schema.financialEntriesTable.entry_date));

  //filtra em memória por safra e janela de datas (caso informados)
  return entries.filter((entry) => {
    if (filters.harvest_id && entry.harvest_id !== filters.harvest_id) {
      return false;
    }
    if (filters.start_date && entry.entry_date < filters.start_date) {
      return false;
    }
    if (filters.end_date && entry.entry_date > filters.end_date) {
      return false;
    }
    return true;
  });
}