import { NextRequest } from "next/server";
import { EquipmentController } from "@/modules/equipments/equipment.controller";

const controller = new EquipmentController();

// busca todos os equipments
export async function GET() {
    return controller.getAll();
}

// cadastra um novo equipment
export async function POST(req: NextRequest) {
    return controller.create(req);
}