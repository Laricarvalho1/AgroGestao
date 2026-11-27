// Função única para falar com a API (GET, POST, PATCH, DELETE).
// Ela devolve os dados já em JSON e, se algo der errado, lança um erro
//  Trata os dois: { erro: "..." } e { error: "..." } 
export class ErroApi extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

type Opcoes = {
  metodo?: "GET" | "POST" | "PATCH" | "DELETE";
  corpo?: unknown;
};

type CorpoDeErro = {
  erro?: unknown;
  error?: unknown;
  details?: { fieldErrors?: Record<string, string[] | undefined> };
};

function mensagemDaResposta(status: number, dados: unknown): string {
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Seu perfil não tem permissão para realizar esta ação.";

  const corpo = (dados ?? {}) as CorpoDeErro;
  
  const detalhe = Object.values(corpo.details?.fieldErrors ?? {})
    .flat()
    .find((mensagem) => typeof mensagem === "string" && mensagem.length > 0);
  if (detalhe) return detalhe;

  if (typeof corpo.erro === "string" && corpo.erro) return corpo.erro;
  if (typeof corpo.error === "string" && corpo.error) return corpo.error;

  // Indicar que falta rota
  if (status === 404) return "Esta função ainda não está disponível no servidor.";
  if (status >= 500) return "Erro interno no servidor. Tente novamente em instantes.";
  return "Não foi possível concluir a operação.";
}

export async function requisitar<T = unknown>(url: string, opcoes: Opcoes = {}): Promise<T> {
  const temCorpo = opcoes.corpo !== undefined;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: opcoes.metodo ?? "GET",
      headers: temCorpo ? { "Content-Type": "application/json" } : undefined,
      body: temCorpo ? JSON.stringify(opcoes.corpo) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ErroApi(
      "Não foi possível conectar ao servidor. Verifique a internet e confira na lista se a operação foi concluída antes de tentar de novo.",
      0,
    );
  }

  // 204 = deu certo e não tem corpo
  if (resposta.status === 204) return undefined as T;

  let dados: unknown = null;
  try {
    dados = await resposta.json();
  } catch {
    // corpo vazio ou que não é JSON 
  }

  if (!resposta.ok) throw new ErroApi(mensagemDaResposta(resposta.status, dados), resposta.status);

  return dados as T;
}

// Pega o texto de qualquer erro capturado em um try/catch
export function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error && erro.message ? erro.message : "Ocorreu um erro inesperado.";
}
