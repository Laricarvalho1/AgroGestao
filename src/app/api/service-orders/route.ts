import { NextRequest } from "next/server";
import { ServiceOrderController } from "@/modules/service-orders/service-order.controller";

const controller = new ServiceOrderController();

//busca todas as ordens de serviço
export async function GET() {
    return controller.getAll();
}

//cadastra uma nova ordem de serviço
export async function POST(req: NextRequest) {
    return controller.save(req);
}