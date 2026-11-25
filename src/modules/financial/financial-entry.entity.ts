export type FinancialEntryType = "INCOME" | "EXPENSE";

export interface FinancialEntryDatabaseRow {
  id: string;
  property_id: string;
  harvest_id: string | null;
  type: FinancialEntryType;
  category: string;
  amount: string;
  entry_date: Date;
  created_at: Date;
  updated_at: Date;
}

export class FinancialEntry {
  readonly id: string;
  readonly property_id: string;
  readonly harvest_id: string | null;
  readonly type: FinancialEntryType;
  readonly category: string;
  readonly amount: number;
  readonly entry_date: Date;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(data: FinancialEntryDatabaseRow) {
    this.id = data.id;
    this.property_id = data.property_id;
    this.harvest_id = data.harvest_id;
    this.type = data.type;
    this.category = data.category;
    this.amount = Number(data.amount);
    this.entry_date = data.entry_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromDB(row: FinancialEntryDatabaseRow | undefined): FinancialEntry | null {
    if (!row) return null;
    return new FinancialEntry(row);
  }
}