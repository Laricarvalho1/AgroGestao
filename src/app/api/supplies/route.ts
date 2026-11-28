import { createSupply, listSupplies } from "@/db/queries";
import { getAuth, hasRole } from "@/lib/auth";
import { createSupplySchema, supplyFiltersSchema } from "@/modules/supplies/supply";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(auth.role, "ADMIN", "FIELD_MANAGER")) return NextResponse.json({ error: "Acesso negado"}, { status: 403 });

  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  
  const filters = supplyFiltersSchema.safeParse(searchParams);
  if (!filters.success) return NextResponse.json({ error: "Filtro inválido", details: filters.error.flatten() }, { status: 400 });

  const rows = await listSupplies(filters.data);
  
  return NextResponse.json(rows, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(auth.role, "ADMIN", "FIELD_MANAGER")) return NextResponse.json({ error: "Acesso negado"}, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição não é um JSON válido" }, { status: 400 })
  }
  
  const parsed = createSupplySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const createdRowResult = await createSupply(parsed.data);
  if (!createdRowResult.ok) {
    const code = createdRowResult.code;
    switch(code) {
      case "DUPLICATE":
        return NextResponse.json({ error: "Já existe um insumo com essa categoria e nome", code }, { status: 409 })
    }
  }
  
  return NextResponse.json(createdRowResult.value, {
    status: 201,
  });
}