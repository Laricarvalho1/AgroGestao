// Endpoints esperados (ainda não existem no repositório):
//   GET /api/properties -> [{ id, name }]
//   GET /api/harvests   -> [{ id, status, start_date, crop_name?, name? }]
// Enquanto não existirem, os formulários deixam o usuário colar o ID manualmente.

import { formatarData } from "./formatar";

export const URL_PROPRIEDADES = "/api/properties";
export const URL_SAFRAS = "/api/harvests";

export type Propriedade = { id: string; name: string };

export type Safra = {
  id: string;
  name?: string;
  crop_name?: string;
  status?: string;
  start_date?: string;
};

export type Opcao = { id: string; rotulo: string };

export function opcoesPropriedades(lista: Propriedade[]): Opcao[] {
  return lista.map((p) => ({ id: p.id, rotulo: p.name }));
}

export function opcoesSafras(lista: Safra[]): Opcao[] {
  return lista.map((s) => ({
    id: s.id,
    rotulo: [
      s.crop_name ?? s.name ?? "Safra",
      s.start_date ? `início ${formatarData(s.start_date)}` : null,
      s.status ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
}

// Procura o rótulo de um id; undefined se a lista não está disponível
export function rotuloDe(opcoes: Opcao[], id: string): string | undefined {
  return opcoes.find((o) => o.id === id)?.rotulo;
}
