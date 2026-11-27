// Campos de formulário no padrão RI-006

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { Opcao } from "@/lib/referencias";

const estiloCampo =
  "min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 disabled:text-gray-600";

type Base = {
  id: string;
  rotulo: string;
  erro?: string;
  obrigatorio?: boolean;
  dica?: string;
};

function Moldura({ id, rotulo, erro, obrigatorio, dica, children }: Base & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-800">
        {rotulo}
        {obrigatorio && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {dica && !erro && <p className="text-xs text-gray-600">{dica}</p>}
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}

// Propriedades de acessibilidade iguais para todos os tipos de campo
function ajuda({ id, erro, obrigatorio }: Base) {
  return {
    id,
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": erro ? `${id}-erro` : undefined,
    "aria-required": obrigatorio ? true : undefined,
  } as const;
}

function corDaBorda(erro?: string) {
  return erro ? "border-red-600" : "border-gray-300";
}

export function CampoTexto({ rotulo, dica, ...resto }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const { erro, obrigatorio, id, ...inputProps } = resto;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} obrigatorio={obrigatorio} dica={dica}>
      <input {...inputProps} {...ajuda({ id, rotulo, erro, obrigatorio })} className={`${estiloCampo} ${corDaBorda(erro)}`} />
    </Moldura>
  );
}

export function CampoSelecao({
  rotulo,
  dica,
  children,
  ...resto
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const { erro, obrigatorio, id, ...selectProps } = resto;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} obrigatorio={obrigatorio} dica={dica}>
      <select {...selectProps} {...ajuda({ id, rotulo, erro, obrigatorio })} className={`${estiloCampo} ${corDaBorda(erro)}`}>
        {children}
      </select>
    </Moldura>
  );
}

export function CampoTextoLongo({ rotulo, dica, ...resto }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { erro, obrigatorio, id, ...textareaProps } = resto;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} obrigatorio={obrigatorio} dica={dica}>
      <textarea
        {...textareaProps}
        {...ajuda({ id, rotulo, erro, obrigatorio })}
        className={`${estiloCampo} min-h-24 ${corDaBorda(erro)}`}
      />
    </Moldura>
  );
}

// Campo para escolher uma propriedade/safra/etc.:
//  - se a lista de opções chegou da API -> mostra uma lista de seleção
//  - se a lista não está disponível     -> (opcional) deixa digitar o ID
type PropsReferencia = Base & {
  opcoes: Opcao[];
  carregando?: boolean;
  valor: string;
  aoMudar: (valor: string) => void;
  permitirDigitar?: boolean; // se false, o campo some quando não há lista
};

export function CampoReferencia({
  opcoes,
  carregando,
  valor,
  aoMudar,
  permitirDigitar = true,
  ...base
}: PropsReferencia) {
  if (carregando) {
    return (
      <CampoSelecao {...base} value="" disabled>
        <option value="">Carregando...</option>
      </CampoSelecao>
    );
  }

  if (opcoes.length > 0) {
    return (
      <CampoSelecao {...base} value={valor} onChange={(e) => aoMudar(e.target.value)}>
        <option value="">Selecione...</option>
        {opcoes.map((opcao) => (
          <option key={opcao.id} value={opcao.id}>
            {opcao.rotulo}
          </option>
        ))}
      </CampoSelecao>
    );
  }

  if (!permitirDigitar) return null;

  return (
    <CampoTexto
      {...base}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      placeholder="Cole aqui o ID (UUID)"
      dica="A lista não está disponível no momento. Informe o ID manualmente."
      autoComplete="off"
    />
  );
}
