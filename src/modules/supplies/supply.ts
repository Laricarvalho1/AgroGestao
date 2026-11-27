import { supplyCategoryEnum, SupplySelect, supplyUnitEnum, type SupplyCategory, type SupplyUnit } from "@/db/schema";
import z from "zod";

export type SupplyStockStatus = "NORMAL" | "REPLENISH";

export type SupplyItem = {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: SupplyUnit;
  min_stock: number;
  average_cost: number;
  active: boolean;
  balance: number;
  total_value: number;
  status: SupplyStockStatus;
};


export const supplyFiltersSchema = z
  .object({
    busca: z.string().trim().min(1).optional(),
    categoria: z.enum(supplyCategoryEnum.enumValues, { error: "Categoria inválida" }).optional(),
    inativos: z.enum(["true", "false"]).optional(),
  })
  .transform((p) => ({
    search: p.busca,
    category: p.categoria,
    includeInactive: p.inativos === "true",
  }));

export type CreateSupplyInput = {
  name: string;
  category: SupplyCategory;
  unit: SupplyUnit;
  min_stock: number;
};

export type UpdateSupplyInput = {
  name?: string;
  category?: SupplyCategory;
  unit?: SupplyUnit;
  min_stock?: number;
  active?: boolean;
};

const supplyName = z.string().trim().min(1, "Informe o nome do insumo").max(150);
const supplyCategory = z.enum(supplyCategoryEnum.enumValues, { error: "Categoria inválida" });
const supplyUnit = z.enum(supplyUnitEnum.enumValues, { error: "Unidade inválida" });
const supplyMinStock = z.number({ error: "Informe o estoque mínimo" }).min(0, "Estoque mínimo não pode ser negativo");

export const createSupplySchema = z.object({
  name: supplyName,
  category: supplyCategory,
  unit: supplyUnit,
  min_stock: supplyMinStock,
}) satisfies z.ZodType<CreateSupplyInput>;

export const updateSupplySchema = z.object({
  name: supplyName.optional(),
  category: supplyCategory.optional(),
  unit: supplyUnit.optional(),
  min_stock: supplyMinStock.optional(),
  active: z.boolean({ error: "Informe se o insumo está ativo" }).optional(),
}) satisfies z.ZodType<UpdateSupplyInput>;



export function stockStatus(balance: number, minStock: number): SupplyStockStatus {
  return balance <= minStock ? "REPLENISH" : "NORMAL";
}

export function toSupplyItem(supply: SupplySelect, balance: number): SupplyItem {
  return {
    id: supply.id,
    name: supply.name,
    category: supply.category,
    unit: supply.unit,
    min_stock: supply.min_stock,
    average_cost: supply.average_cost,
    active: supply.active,
    balance,
    total_value: Math.round(balance * supply.average_cost * 100) / 100,
    status: stockStatus(balance, supply.min_stock),
  };
}