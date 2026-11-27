// Regras de validação dos formulários
//
// Cada função devolve a mensagem de erro, ou undefined quando está tudo certo.

import { casasDecimais, formatarNumero, lerNumero } from "./formatar";

export const VALOR_MAXIMO = 99999999.99;

export function erroTexto(valor: string, nome: string, max: number): string | undefined {
  const texto = valor.trim();
  if (texto.length === 0) return `Informe ${nome}.`;
  if (texto.length > max) return `Use no máximo ${max} caracteres.`;
  return undefined;
}

type RegraNumero = {
  casas: number; 
  maiorQueZero?: boolean; 
  max?: number;
};

export function erroNumero(texto: string, nome: string, regra: RegraNumero): string | undefined {
  if (texto.trim() === "") return `Informe ${nome}.`;

  const numero = lerNumero(texto);
  if (Number.isNaN(numero)) return "Digite um número válido (use vírgula para decimais).";

  if (casasDecimais(texto) > regra.casas) {
    return regra.casas === 0 ? "Use apenas números inteiros." : `Use no máximo ${regra.casas} casas decimais.`;
  }

  if (regra.maiorQueZero && numero <= 0) return "O valor deve ser maior que zero.";
  if (regra.max !== undefined && numero > regra.max) {
    return `O valor máximo é ${formatarNumero(regra.max, regra.casas)}.`;
  }
  return undefined;
}

// CPF/CNPJ é opcional, mas se vier precisa ter 11 ou 14 dígitos
export function erroDocumento(valor: string): string | undefined {
  const texto = valor.trim();
  if (texto === "") return undefined;

  const digitos = texto.replace(/\D/g, "");
  const soTemCaracteresValidos = /^[\d.\-/\s]+$/.test(texto);

  if (!soTemCaracteresValidos || (digitos.length !== 11 && digitos.length !== 14)) {
    return "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).";
  }
  return undefined;
}

// Padroniza antes de enviar. O resultado cabe nos 18 caracteres da coluna tax_id.
export function formatarDocumento(valor: string): string {
  const digitos = valor.replace(/\D/g, "");

  if (digitos.length === 11) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digitos.length === 14) {
    return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return valor.trim();
}

export function temErros(erros: Record<string, string | undefined>): boolean {
  return Object.values(erros).some(Boolean);
}
