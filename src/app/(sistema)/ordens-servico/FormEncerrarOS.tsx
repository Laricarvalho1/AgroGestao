"use client";

// Encerramento de ordem de serviço.
//   PATCH /api/service-orders/{id}/close  { parts_cost, labor_cost, harvest_id? }
// Ao encerrar, a API devolve a máquina para "Disponível" e lança o custo total
// como despesa "Mecanização / Frota" no financeiro.

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import { CampoReferencia, CampoTexto } from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import { formatarMoeda, lerNumero } from "@/lib/formatar";
import { mensagemDoErro, requisitar } from "@/lib/http";
import type { Opcao } from "@/lib/referencias";
import { erroNumero, temErros, VALOR_MAXIMO } from "@/lib/validacao";
import type { OrdemServico } from "./tipos";

type Props = {
  ordem: OrdemServico;
  nomeEquipamento: string;
  safras: Opcao[]; 
  carregandoSafras: boolean;
  aoCancelar: () => void;
  aoSalvar: (mensagem: string) => void;
};

export default function FormEncerrarOS({ ordem, nomeEquipamento, safras, carregandoSafras, aoCancelar, aoSalvar }: Props) {
  const [pecas, setPecas] = useState("");
  const [maoDeObra, setMaoDeObra] = useState("");
  const [safra, setSafra] = useState("");
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  const regra = { casas: 2, max: VALOR_MAXIMO };
  const todosErros: Record<string, string | undefined> = {
    parts_cost: erroNumero(pecas, "o custo das peças (pode ser 0)", regra),
    labor_cost: erroNumero(maoDeObra, "o custo da mão de obra (pode ser 0)", regra),
  };
  const erros = tentou ? todosErros : {};

  const total =
    !todosErros.parts_cost && !todosErros.labor_cost ? Number((lerNumero(pecas) + lerNumero(maoDeObra)).toFixed(2)) : null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(todosErros)) return;

    setEnviando(true);
    setErroEnvio("");
    try {
      await requisitar(`/api/service-orders/${ordem.id}/close`, {
        metodo: "PATCH",
        corpo: {
          parts_cost: lerNumero(pecas),
          labor_cost: lerNumero(maoDeObra),
          ...(safra ? { harvest_id: safra } : {}),
        },
      });
      aoSalvar(`Ordem de serviço de ${nomeEquipamento} encerrada. O equipamento está disponível novamente.`);
    } catch (erro) {
      setErroEnvio(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Encerrar ordem de serviço" aoFechar={enviando ? () => {} : aoCancelar}>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <p className="rounded-lg bg-[#f8f7f6] p-3 text-sm leading-relaxed">
          Equipamento: <strong>{nomeEquipamento}</strong>
          <br />
          Serviço: {ordem.description}
        </p>

        <p className="text-xs text-gray-600">Campos com * são obrigatórios. Use vírgula para os centavos.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoTexto
            id="parts_cost"
            rotulo="Custo das peças (R$)"
            obrigatorio
            inputMode="decimal"
            value={pecas}
            onChange={(e) => setPecas(e.target.value)}
            erro={erros.parts_cost}
            disabled={enviando}
            autoFocus
          />
          <CampoTexto
            id="labor_cost"
            rotulo="Custo da mão de obra (R$)"
            obrigatorio
            inputMode="decimal"
            value={maoDeObra}
            onChange={(e) => setMaoDeObra(e.target.value)}
            erro={erros.labor_cost}
            disabled={enviando}
          />
        </div>

        <CampoReferencia
          id="harvest_id"
          rotulo="Safra relacionada (opcional)"
          opcoes={safras}
          carregando={carregandoSafras}
          valor={safra}
          aoMudar={setSafra}
          permitirDigitar={false}
        />

        <p className="text-base">
          Custo total: <strong>{total === null ? "—" : formatarMoeda(total)}</strong>
        </p>

        <p className="text-sm text-amber-900">
          Ao encerrar, o equipamento volta a ficar disponível e o custo total é lançado como despesa no financeiro. Esta ação
          não pode ser desfeita.
        </p>

        {erroEnvio && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {erroEnvio}
          </p>
        )}
        {tentou && temErros(todosErros) && <p className="text-sm text-red-700">Corrija os campos destacados para continuar.</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <Botao onClick={aoCancelar} disabled={enviando}>
            Voltar
          </Botao>
          <Botao type="submit" variante="primario" disabled={enviando}>
            {enviando ? "Encerrando..." : "Encerrar OS"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
