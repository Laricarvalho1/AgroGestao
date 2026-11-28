import { NextRequest } from "next/server";
import { SalesContractController } from "@/modules/sales-contracts/sales-contract.controller";

const controller = new SalesContractController();

type Contexto = {
    params: Promise<{ id: string }>
};

export async function POST(req: NextRequest, contexto: Contexto) {
    const { id } = await contexto.params;

    return controller.cancelContract(id, req);
}