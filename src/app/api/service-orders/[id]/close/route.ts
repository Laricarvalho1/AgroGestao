import { closeServiceOrder } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import {
  CloseServiceOrderDTO,
  closeServiceOrderSchema,
} from "@/modules/service-orders/close-service-order.dto";
import { ResponseServiceOrderDTO } from "@/modules/service-orders/response-service-order.dto";
import { ServiceOrder } from "@/modules/service-orders/service-order.entity";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = closeServiceOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const dto = new CloseServiceOrderDTO(parsed.data);
    const updatedRow = await closeServiceOrder(id, dto);
    const entity = ServiceOrder.fromDB(updatedRow)!;
    return NextResponse.json(ResponseServiceOrderDTO.fromServiceOrder(entity), {
      status: 200,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Ordem de Serviço não encontrada" }, { status: 404 });
    }
    if (err instanceof Error && err.message === "ALREADY_COMPLETED") {
      return NextResponse.json({ error: "Ordem de Serviço já concluída" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao encerrar OS" }, { status: 500 });
  }
}