// Formato do equipamento como a API devolve (GET /api/equipments)

import type { Tom } from "@/components/ui/Selo";

export type StatusEquipamento = "AVAILABLE" | "UNAVAILABLE";

export type Equipamento = {
  id: string;
  identification: string;
  current_hour_meter: number;
  status: StatusEquipamento;
  brand: string;
  model: string;
  manufacture_year: number;
  category: string;
  maintenance_interval: number;
  property_id: string;
};

export const SITUACAO_EQUIPAMENTO: Record<StatusEquipamento, { texto: string; tom: Tom }> = {
  AVAILABLE: { texto: "Disponível", tom: "verde" },
  UNAVAILABLE: { texto: "Indisponível (manutenção)", tom: "amarelo" },
};
