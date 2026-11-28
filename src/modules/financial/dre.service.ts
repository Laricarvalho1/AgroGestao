import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { DREQueryDTO } from "./dre.dto";

export interface DRECategorySummary {
  category: string;
  total: number;
  percentage: number;
  entries_count: number;
  entries: {
    id: string;
    property_id: string;
    harvest_id: string | null;
    amount: number;
    entry_date: Date;
  }[];
}

export async function generateOperationalDRE(filters: DREQueryDTO) {
  //1) busca lançamentos financeiros
  const allEntries = filters.property_id
    ? await db
        .select()
        .from(schema.financialEntriesTable)
        .where(eq(schema.financialEntriesTable.property_id, filters.property_id))
        .orderBy(desc(schema.financialEntriesTable.entry_date))
    : await db
        .select()
        .from(schema.financialEntriesTable)
        .orderBy(desc(schema.financialEntriesTable.entry_date));

  //2) aplica filtros opcionais de safra e janela de datas
  const filteredEntries = allEntries.filter((entry) => {
    if (filters.harvest_id && entry.harvest_id !== filters.harvest_id) {
      return false;
    }
    if (filters.start_date && entry.entry_date < filters.start_date) {
      return false;
    }
    if (filters.end_date) {
      const endOfDay = new Date(filters.end_date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      if (entry.entry_date > endOfDay) return false;
    }
    return true;
  });

  //3) separa receitas (INCOME) e despesas (EXPENSE)
  const incomeEntries = filteredEntries.filter((e) => e.type === "INCOME");
  const expenseEntries = filteredEntries.filter((e) => e.type === "EXPENSE");

  const totalIncome = incomeEntries.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  );
  const totalExpense = expenseEntries.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  );
  const netProfit = totalIncome - totalExpense; // rf-046
  const profitMargin =
    totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(2)) : 0;

  //4) agrupa despesas por categoria com lista individual para Drill-Down (RN02)
  const categoryMap = new Map<string, DRECategorySummary>();

  for (const item of expenseEntries) {
    const val = Number(item.amount);
    const current = categoryMap.get(item.category) ?? {
      category: item.category,
      total: 0,
      percentage: 0,
      entries_count: 0,
      entries: [],
    };

    current.total += val;
    current.entries_count += 1;
    current.entries.push({
      id: item.id,
      property_id: item.property_id,
      harvest_id: item.harvest_id,
      amount: val,
      entry_date: item.entry_date,
    });

    categoryMap.set(item.category, current);
  }

  const expensesByCategory: DRECategorySummary[] = Array.from(
    categoryMap.values()
  )
    .map((cat) => ({
      ...cat,
      percentage:
        totalExpense > 0
          ? Number(((cat.total / totalExpense) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 5) calcula indicadores por hectare (RN01) usando a área da(s) propriedade(s)
  const properties = filters.property_id
    ? await db
        .select()
        .from(schema.propertiesTable)
        .where(eq(schema.propertiesTable.id, filters.property_id))
    : await db.select().from(schema.propertiesTable);

  const totalHectares = properties.reduce(
    (acc, prop) => acc + Number(prop.total_area_hectares),
    0
  );

  const costPerHectare =
    totalHectares > 0 ? Number((totalExpense / totalHectares).toFixed(2)) : 0;
  const profitPerHectare =
    totalHectares > 0 ? Number((netProfit / totalHectares).toFixed(2)) : 0;

  return {
    summary: {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_profit: netProfit,
      profit_margin_percentage: profitMargin,
      total_hectares: totalHectares,
      cost_per_hectare: costPerHectare,
      profit_per_hectare: profitPerHectare,
      total_records: filteredEntries.length,
    },
    expenses_by_category: expensesByCategory,
    income_entries: incomeEntries.map((item) => ({
      id: item.id,
      property_id: item.property_id,
      harvest_id: item.harvest_id,
      category: item.category,
      amount: Number(item.amount),
      entry_date: item.entry_date,
    })),
  };
}