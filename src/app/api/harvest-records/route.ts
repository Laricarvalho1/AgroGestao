import { NextRequest, NextResponse } from "next/server";
import { createHarvestRecord } from "@/db/queries";
import { createHarvestRecordSchema } from "@/modules/harvest-records/create-harvest-record.dto";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// POST /api/harvest-records -> Registra novo apontamento de colheita (UC07)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validação estrita de entrada via DTO (Zod)
    const parsed = createHarvestRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados de entrada inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Executa a regra de negócio e grava no banco
    const result = await createHarvestRecord(parsed.data);

    // 3. Retorna o Recibo Eletrônico de Lançamento (RF-027 / RN02)
    return NextResponse.json(
      {
        message: "Apontamento de colheita registrado com sucesso!",
        receipt: {
          ticket_id: result.record.id,
          weighing_ticket: result.record.weighing_ticket,
          harvest_id: result.record.harvest_id,
          volume_harvested: Number(result.record.volume_harvested),
          unit: result.record.unit,
          storage_destination: result.record.storage_destination,
          harvest_date: result.record.harvest_date,
          accumulated_volume: result.accumulated_volume,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error & { code?: string };

    // Tratamento dos Fluxos de Exceção e Regras de Negócio do UC07
    if (err.message === "HARVEST_NOT_FOUND") {
      return NextResponse.json(
        { error: "Safra não encontrada no sistema." },
        { status: 404 }
      );
    }

    if (err.message === "HARVEST_NOT_ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Operação bloqueada: Só é permitido lançar colheita em safras com status 'Em Andamento'.",
        },
        { status: 422 }
      );
    }

    // Erro de chave única do PostgreSQL (Ticket de pesagem duplicado)
    if (err.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Este número de ticket de pesagem/transporte já foi registrado anteriormente.",
        },
        { status: 409 }
      );
    }

    console.error("Erro ao registrar colheita:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o apontamento de colheita." },
      { status: 500 }
    );
  }
}

// GET /api/harvest-records?harvest_id=... -> Lista apontamentos para exibir histórico e saldo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const harvestId = searchParams.get("harvest_id");

    const records = harvestId
      ? await db
          .select()
          .from(schema.harvestRecordsTable)
          .where(eq(schema.harvestRecordsTable.harvest_id, harvestId))
          .orderBy(desc(schema.harvestRecordsTable.harvest_date))
      : await db
          .select()
          .from(schema.harvestRecordsTable)
          .orderBy(desc(schema.harvestRecordsTable.harvest_date));

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar colheitas:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar registros de colheita." },
      { status: 500 }
    );
  }
}