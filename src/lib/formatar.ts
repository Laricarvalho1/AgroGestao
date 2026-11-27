// Formatação e leitura de valores no padrão brasileiro

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Preço unitário pode ter mais de 2 casas 
const precoUnitario = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

export function formatarPrecoUnitario(valor: number): string {
  return precoUnitario.format(valor);
}

export function formatarNumero(valor: number, casasMaximas = 2): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: casasMaximas }).format(valor);
}

// Aceita "2026-11-26" (campo date) ou um timestamp ISO (created_at)
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "—";

  const simples = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (simples) return `${simples[3]}/${simples[2]}/${simples[1]}`;

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}


export function hoje(): string {
  return new Date().toLocaleDateString("sv-SE");
}

// Os 6 últimos caracteres do UUID servem como identificação curta do registro
export function idCurto(id: string): string {
  return id.slice(-6).toUpperCase();
}

// ---------- Leitura de números digitados pelo usuário ----------
// "1.234,56" -> "1234.56"   |   "12,5" -> "12.5"   |   "12.5" -> "12.5"
function normalizarNumero(texto: string): string {
  const limpo = texto.trim().replace(/\s/g, "");
  return limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
}

// Devolve NaN quando o texto não é um número válido
export function lerNumero(texto: string): number {
  const normal = normalizarNumero(texto);
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : Number.NaN;
}

export function casasDecimais(texto: string): number {
  const normal = normalizarNumero(texto);
  const posicao = normal.indexOf(".");
  return posicao === -1 ? 0 : normal.length - posicao - 1;
}

// Número vindo da API -> texto para preencher um campo ("12.5" -> "12,5")
export function numeroParaCampo(valor: number): string {
  return String(valor).replace(".", ",");
}
