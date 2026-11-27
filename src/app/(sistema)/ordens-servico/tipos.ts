// Formato da ordem de serviço como a API devolve (GET /api/service-orders)

import type { Tom } from "@/components/ui/Selo";

export type StatusOrdem = "OPEN" | "IN_MAINTENANCE" | "COMPLETED";
export type TipoManutencao = "PREVENTIVE" | "CORRECTIVE";

export type OrdemServico = {
  id: string;
  equipment_id: string;
  maintenance_type: TipoManutencao;
  hour_meter: number;
  description: string;
  status: StatusOrdem;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
};

export const SITUACAO_ORDEM: Record<StatusOrdem, { texto: string; tom: Tom }> = {
  OPEN: { texto: "Aberta", tom: "amarelo" },
  IN_MAINTENANCE: { texto: "Em manutenção", tom: "amarelo" },
  COMPLETED: { texto: "Concluída", tom: "verde" },
};

export const ROTULO_TIPO: Record<TipoManutencao, string> = {
  PREVENTIVE: "Preventiva",
  CORRECTIVE: "Corretiva",
};

// A API só permite excluir OS aberta e sem custos registrados
export function podeExcluir(ordem: OrdemServico): boolean {
  return ordem.status === "OPEN" && ordem.parts_cost === 0 && ordem.labor_cost === 0;
}
