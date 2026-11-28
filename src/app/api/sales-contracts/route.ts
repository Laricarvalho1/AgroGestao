import { NextRequest } from "next/server";
import { SalesContractController } from "@/modules/sales-contracts/sales-contract.controller";

const controller = new SalesContractController();

export async function GET(req: NextRequest) {
    return controller.getAll(req);
}

export async function POST(req: NextRequest) {
    return controller.save(req);
}