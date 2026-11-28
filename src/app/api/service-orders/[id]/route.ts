import { NextRequest } from "next/server";
import { ServiceOrderController } from "@/modules/service-orders/service-order.controller";

const controller = new ServiceOrderController();

type Contexto = {
    params: Promise<{ id: string }>
};

// busca uma ordem de serviço pelo ID
export async function GET(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.getById(id);
}

// atualiza uma ordem de serviço
export async function PATCH(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.update(id, req);
}

// exclui uma ordem de serviço aberta e sem custos registrados
export async function DELETE(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.remove(id);
}