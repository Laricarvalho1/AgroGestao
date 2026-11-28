import { NextRequest } from "next/server";
import { SalesContractController } from "@/modules/sales-contracts/sales-contract.controller";

const controller = new SalesContractController();

type Contexto = {
    params: Promise<{ id: string }>
};

export async function GET(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.getById(id);
}

export async function PATCH(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.update(id, req);
}

export async function DELETE(req: NextRequest, contexto: Contexto) {

    const { id } = await contexto.params;

    return controller.remove(id);
}