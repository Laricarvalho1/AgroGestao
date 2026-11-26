import { deleteFinancialEntry, updateFinancialEntry } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import {
  ResponseFinancialEntryDTO,
  updateFinancialEntrySchema,
} from "@/modules/financial/financial-entry.dto";
import { FinancialEntry } from "@/modules/financial/financial-entry.entity";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateFinancialEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updatedRow = await updateFinancialEntry(id, parsed.data);
  const entity = FinancialEntry.fromDB(updatedRow);
  if (!entity) {
    return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(ResponseFinancialEntryDTO.fromEntry(entity), {
    status: 200,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const removed = await deleteFinancialEntry(id);
  if (!removed) {
    return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}