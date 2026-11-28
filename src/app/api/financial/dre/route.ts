import { NextRequest, NextResponse } from "next/server";
import { dreQuerySchema } from "@/modules/financial/dre.dto";
import { generateOperationalDRE } from "@/modules/financial/dre.service";

// GET /api/financial/dre?property_id=...&harvest_id=...&start_date=...&end_date=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      property_id: searchParams.get("property_id") || undefined,
      harvest_id: searchParams.get("harvest_id") || undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
    };

    const parsed = dreQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Parâmetros de filtro inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const dreReport = await generateOperationalDRE(parsed.data);
    return NextResponse.json(dreReport, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar DRE Operacional:", error);
    return NextResponse.json(
      { error: "Erro interno ao consolidar o DRE Operacional." },
      { status: 500 }
    );
  }
}