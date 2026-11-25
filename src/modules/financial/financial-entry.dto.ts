import { z } from "zod";
import { FinancialEntry, FinancialEntryType } from "./financial-entry.entity";

export const createFinancialEntrySchema = z.object({
  property_id: z.string().uuid("Propriedade inválida"),
  harvest_id: z.string().uuid().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
  category: z.string().min(2, "Categoria obrigatória").max(100),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  entry_date: z.coerce.date().optional(),
});

export const updateFinancialEntrySchema = createFinancialEntrySchema.partial();

export class CreateFinancialEntryDTO {
  readonly property_id: string;
  readonly harvest_id: string | null;
  readonly type: FinancialEntryType;
  readonly category: string;
  readonly amount: number;
  readonly entry_date: Date;

  constructor(data: z.infer<typeof createFinancialEntrySchema>) {
    this.property_id = data.property_id;
    this.harvest_id = data.harvest_id ?? null;
    this.type = data.type;
    this.category = data.category;
    this.amount = data.amount;
    this.entry_date = data.entry_date ?? new Date();
  }
}

export class ResponseFinancialEntryDTO {
  id: string;
  property_id: string;
  harvest_id: string | null;
  type: FinancialEntryType;
  category: string;
  amount: number;
  entry_date: Date;
  created_at: Date;
  updated_at: Date;

  private constructor(entry: FinancialEntry) {
    this.id = entry.id;
    this.property_id = entry.property_id;
    this.harvest_id = entry.harvest_id;
    this.type = entry.type;
    this.category = entry.category;
    this.amount = entry.amount;
    this.entry_date = entry.entry_date;
    this.created_at = entry.created_at;
    this.updated_at = entry.updated_at;
  }

  static fromEntry(entry: FinancialEntry): ResponseFinancialEntryDTO {
    return new ResponseFinancialEntryDTO(entry);
  }
}