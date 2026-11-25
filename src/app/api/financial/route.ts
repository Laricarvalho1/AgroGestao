import { createFinancialEntry, listFinancialEntries } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import {
  CreateFinancialEntryDTO,
  createFinancialEntrySchema,
  ResponseFinancialEntryDTO,
} from "@/modules/financial/financial-entry.dto";
import { FinancialEntry } from "@/modules/financial/financial-entry.entity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const rows = await listFinancialEntries();
  const response = rows
    .map((r) => FinancialEntry.fromDB(r)!)
    .map(ResponseFinancialEntryDTO.fromEntry);

  return NextResponse.json(response, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await req.json();
  const parsed = createFinancialEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dto = new CreateFinancialEntryDTO(parsed.data);
  const created = FinancialEntry.fromDB(await createFinancialEntry(dto))!;

  return NextResponse.json(ResponseFinancialEntryDTO.fromEntry(created), {
    status: 201,
  });
}