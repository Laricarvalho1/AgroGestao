import { NextRequest } from "next/server";
import { ServiceOrderController } from "@/modules/service-orders/service-order.controller";

const controller = new ServiceOrderController();

type Contexto = {
    params: Promise<{ equipmentId: string }>
};

// busca a ordem de serviço aberta de um equipment
export async function GET(req: NextRequest, contexto: Contexto) {

    const { equipmentId } = await contexto.params;

    return controller.getOpenByEquipment(equipmentId);
}