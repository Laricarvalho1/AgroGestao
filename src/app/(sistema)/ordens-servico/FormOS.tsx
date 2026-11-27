"use client";

// Formulário para abrir e editar ordem de serviço (OS).
//   POST  /api/service-orders        -> abre uma OS (a máquina fica Indisponível)
//   PATCH /api/service-orders/{id}   -> edita tipo e descrição (só OS não encerrada)

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import { CampoSelecao, CampoTexto, CampoTextoLongo } from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import { lerNumero, numeroParaCampo } from "@/lib/formatar";
import { mensagemDoErro, requisitar } from "@/lib/http";
import { erroNumero, erroTexto, temErros, VALOR_MAXIMO } from "@/lib/validacao";
import type { Equipamento } from "../frota/tipos";
import { ROTULO_TIPO, type OrdemServico, type TipoManutencao } from "./tipos";

type Props = {
  ordem: OrdemServico | null; 
  equipamentos: Equipamento[]; 
  aoCancelar: () => void;
  aoSalvar: (mensagem: string) => void;
};

type Dados = {
  equipment_id: string;
  maintenance_type: "" | TipoManutencao;
  hour_meter: string;
  description: string;
};

const LIMITE_DESCRICAO = 200;

export default function FormOS({ ordem, equipamentos, aoCancelar, aoSalvar }: Props) {
  const disponiveis = equipamentos.filter((e) => e.status === "AVAILABLE");

  const [dados, setDados] = useState<Dados>({
    equipment_id: ordem?.equipment_id ?? "",
    maintenance_type: ordem?.maintenance_type ?? "",
    hour_meter: ordem ? numeroParaCampo(ordem.hour_meter) : "",
    description: ordem?.description ?? "",
  });
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  const equipamentoEscolhido = equipamentos.find((e) => e.id === (ordem?.equipment_id ?? dados.equipment_id));

  // ---------- validação ----------
  const todosErros: Record<string, string | undefined> = {
    maintenance_type: dados.maintenance_type ? undefined : "Selecione o tipo de manutenção.",
    description: erroTexto(dados.description, "a descrição do serviço", LIMITE_DESCRICAO),
  };

  if (!ordem) {
    todosErros.equipment_id = dados.equipment_id ? undefined : "Selecione o equipamento.";
    todosErros.hour_meter = erroNumero(dados.hour_meter, "o horímetro atual", { casas: 2, max: VALOR_MAXIMO });

    // O horímetro não pode ser menor que o último registrado da máquina 
    if (!todosErros.hour_meter && equipamentoEscolhido && lerNumero(dados.hour_meter) < equipamentoEscolhido.current_hour_meter) {
      todosErros.hour_meter = `O horímetro não pode ser menor que o último registrado (${numeroParaCampo(equipamentoEscolhido.current_hour_meter)} h).`;
    }
  }
  const erros = tentou ? todosErros : {};

  // Ao escolher a máquina, já sugere o horímetro atual dela
  function escolherEquipamento(id: string) {
    const equipamento = equipamentos.find((e) => e.id === id);
    setDados((antigo) => ({
      ...antigo,
      equipment_id: id,
      hour_meter: equipamento ? numeroParaCampo(equipamento.current_hour_meter) : "",
    }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(todosErros)) return;

    setEnviando(true);
    setErroEnvio("");
    try {
      if (ordem) {
        await requisitar(`/api/service-orders/${ordem.id}`, {
          metodo: "PATCH",
          corpo: { maintenance_type: dados.maintenance_type, description: dados.description.trim() },
        });
        aoSalvar("Ordem de serviço atualizada.");
      } else {
        await requisitar("/api/service-orders", {
          metodo: "POST",
          corpo: {
            equipment_id: dados.equipment_id,
            maintenance_type: dados.maintenance_type,
            hour_meter: lerNumero(dados.hour_meter),
            description: dados.description.trim(),
          },
        });
        aoSalvar(`Ordem de serviço aberta. ${equipamentoEscolhido?.identification ?? "O equipamento"} está indisponível até o encerramento.`);
      }
    } catch (erro) {
      setErroEnvio(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={ordem ? "Editar ordem de serviço" : "Abrir ordem de serviço"} aoFechar={enviando ? () => {} : aoCancelar}>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <p className="text-xs text-gray-600">Campos com * são obrigatórios.</p>

        {ordem ? (
          <p className="rounded-lg bg-[#f8f7f6] p-3 text-sm">
            Equipamento: <strong>{equipamentoEscolhido?.identification ?? "—"}</strong>
          </p>
        ) : (
          <>
            <CampoSelecao
              id="equipment_id"
              rotulo="Equipamento"
              obrigatorio
              value={dados.equipment_id}
              onChange={(e) => escolherEquipamento(e.target.value)}
              erro={erros.equipment_id}
              dica={disponiveis.length === 0 ? "Nenhum equipamento disponível: todos já estão com OS aberta." : undefined}
              disabled={enviando}
            >
              <option value="">Selecione...</option>
              {disponiveis.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.identification} — {e.brand} {e.model}
                </option>
              ))}
            </CampoSelecao>

            <CampoTexto
              id="hour_meter"
              rotulo="Horímetro atual (h)"
              obrigatorio
              inputMode="decimal"
              value={dados.hour_meter}
              onChange={(e) => setDados((antigo) => ({ ...antigo, hour_meter: e.target.value }))}
              erro={erros.hour_meter}
              disabled={enviando}
            />
          </>
        )}

        <CampoSelecao
          id="maintenance_type"
          rotulo="Tipo de manutenção"
          obrigatorio
          value={dados.maintenance_type}
          onChange={(e) => setDados((antigo) => ({ ...antigo, maintenance_type: e.target.value as Dados["maintenance_type"] }))}
          erro={erros.maintenance_type}
          disabled={enviando}
        >
          <option value="">Selecione...</option>
          {(Object.keys(ROTULO_TIPO) as TipoManutencao[]).map((tipo) => (
            <option key={tipo} value={tipo}>
              {ROTULO_TIPO[tipo]}
            </option>
          ))}
        </CampoSelecao>

        <CampoTextoLongo
          id="description"
          rotulo="Descrição do serviço"
          obrigatorio
          maxLength={LIMITE_DESCRICAO + 50} 
          value={dados.description}
          onChange={(e) => setDados((antigo) => ({ ...antigo, description: e.target.value }))}
          erro={erros.description}
          dica={`${dados.description.trim().length}/${LIMITE_DESCRICAO} caracteres`}
          disabled={enviando}
        />

        {erroEnvio && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {erroEnvio}
          </p>
        )}
        {tentou && temErros(todosErros) && <p className="text-sm text-red-700">Corrija os campos destacados para continuar.</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <Botao onClick={aoCancelar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="primario" disabled={enviando}>
            {enviando ? "Salvando..." : ordem ? "Salvar" : "Abrir OS"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
