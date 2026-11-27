import type { Tom } from "@/components/ui/Selo";

export type StatusContrato = "PENDING" | "CONFIRMED" | "CANCELLED";

// GET /api/sales-contracts
export type Contrato = {
  id: string;
  buyer: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  unit: string;
  contract_date: string; // aaaa-mm-dd
  harvest_id: string;
  property_id: string;
  payment_terms: string;
  tax_id: string | null;
  contact: string | null;
  status: StatusContrato;
  cancellation_reason: string | null;
};

// GET /api/sales-contracts/balance?harvest_id={id}   (ENDPOINT NOVO, ainda não existe)
// Saldo = total colhido da safra - contratos CONFIRMADOS (RF-087)
export type SaldoSafra = {
  harvest_id: string;
  unit: string; // unidade de produção da cultura (sc ou t)
  total_harvested: number; // total colhido
  total_sold: number; // soma dos contratos confirmados
  available: number; // saldo disponível para venda
};

export const SITUACAO_CONTRATO: Record<StatusContrato, { texto: string; tom: Tom }> = {
  PENDING: { texto: "Pendente", tom: "amarelo" },
  CONFIRMED: { texto: "Confirmado", tom: "verde" },
  CANCELLED: { texto: "Cancelado", tom: "cinza" },
};

// Unidades de produção do documento de requisitos (RD-003)
export const UNIDADES = ["sc", "t"];
