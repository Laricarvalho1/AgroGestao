import { updateSupply } from "@/db/queries";
import { getAuth, hasRole } from "@/lib/auth";
import { updateSupplySchema } from "@/modules/supplies/supply";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasRole(auth.role, "ADMIN", "FIELD_MANAGER")) return NextResponse.json({ error: "Acesso negado"}, { status: 403 });


  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição não é um JSON válido" }, { status: 400 })
  }

  const parsed = updateSupplySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { error: "Insumo não encontrado", code: "NOT_FOUND" },
      { status: 404 }
    )
  }

  const updatedRowResult = await updateSupply(id, parsed.data)
  if (!updatedRowResult.ok) {
    const code = updatedRowResult.code
    switch (code) {
        case "NOT_FOUND":
            return NextResponse.json(
                { error: "Insumo não encontrado", code },
                { status: 404 }
            )
        case "SUPPLY_LOCKED":
            return NextResponse.json(
                { error: "Unidade e categoria não podem mudar depois da primeira movimentação", code },
                { status: 409 }
            )
        case "DUPLICATE":
            return NextResponse.json(
                { error: "Já existe um insumo com essa categoria e nome", code },
                { status: 409 }
            )
    }
  }
  const updatedRow = updatedRowResult.value;

  return NextResponse.json(updatedRow, {
    status: 200,
  });
}