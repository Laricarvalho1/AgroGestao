"use client";

// Formulário de cadastro e edição de equipamento.
//   POST  /api/equipments        -> cadastra
//   PATCH /api/equipments/{id}   -> edita (a API não aceita mudar status nem propriedade)

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import { CampoReferencia, CampoTexto } from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import { lerNumero, numeroParaCampo } from "@/lib/formatar";
import { mensagemDoErro, requisitar } from "@/lib/http";
import type { Opcao } from "@/lib/referencias";
import { erroNumero, erroTexto, temErros, VALOR_MAXIMO } from "@/lib/validacao";
import { isUUID } from "@/lib/uuid";
import type { Equipamento } from "./tipos";

type Props = {
  equipamento: Equipamento | null; // null = novo equipamento
  propriedades: Opcao[];
  carregandoPropriedades: boolean;
  aoCancelar: () => void;
  aoSalvar: (mensagem: string) => void;
};

type Dados = {
  identification: string;
  brand: string;
  model: string;
  manufacture_year: string;
  category: string;
  current_hour_meter: string;
  maintenance_interval: string;
  property_id: string;
};

const CATEGORIAS_SUGERIDAS = ["Trator", "Colheitadeira", "Pulverizador", "Plantadeira", "Implemento", "Caminhão"];
const ANO_MINIMO = 1900;

function validar(d: Dados, atual: Equipamento | null): Record<string, string | undefined> {
  const anoMaximo = new Date().getFullYear() + 1;
  const erros: Record<string, string | undefined> = {
    identification: erroTexto(d.identification, "a identificação do equipamento", 100),
    brand: erroTexto(d.brand, "a marca", 100),
    model: erroTexto(d.model, "o modelo", 100),
    category: erroTexto(d.category, "a categoria", 100),
    manufacture_year: erroNumero(d.manufacture_year, "o ano de fabricação", { casas: 0, maiorQueZero: true }),
    current_hour_meter: erroNumero(d.current_hour_meter, "o horímetro atual", { casas: 2, max: VALOR_MAXIMO }),
    maintenance_interval: erroNumero(d.maintenance_interval, "o intervalo de manutenção", {
      casas: 2,
      maiorQueZero: true,
      max: VALOR_MAXIMO,
    }),
  };

  const ano = lerNumero(d.manufacture_year);
  if (!erros.manufacture_year && (ano < ANO_MINIMO || ano > anoMaximo)) {
    erros.manufacture_year = `Informe um ano entre ${ANO_MINIMO} e ${anoMaximo}.`;
  }

  // O horímetro nunca pode diminuir (RF-029)
  const horimetro = lerNumero(d.current_hour_meter);
  if (!erros.current_hour_meter && atual && horimetro < atual.current_hour_meter) {
    erros.current_hour_meter = `O horímetro não pode ser menor que o atual (${numeroParaCampo(atual.current_hour_meter)} h).`;
  }

  if (!atual && !isUUID(d.property_id.trim())) {
    erros.property_id = d.property_id.trim() ? "ID da propriedade inválido." : "Selecione a propriedade.";
  }

  return erros;
}

export default function FormEquipamento({
  equipamento,
  propriedades,
  carregandoPropriedades,
  aoCancelar,
  aoSalvar,
}: Props) {
  const [dados, setDados] = useState<Dados>({
    identification: equipamento?.identification ?? "",
    brand: equipamento?.brand ?? "",
    model: equipamento?.model ?? "",
    manufacture_year: equipamento ? String(equipamento.manufacture_year) : "",
    category: equipamento?.category ?? "",
    current_hour_meter: equipamento ? numeroParaCampo(equipamento.current_hour_meter) : "",
    maintenance_interval: equipamento ? numeroParaCampo(equipamento.maintenance_interval) : "",
    property_id: "",
  });
  const [tentou, setTentou] = useState(false); // só mostra os erros depois da 1ª tentativa de salvar
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  const todosErros = validar(dados, equipamento);
  const erros = tentou ? todosErros : {};

  // Atualiza um campo de texto: onChange={mudar("brand")}
  const mudar = (campo: keyof Dados) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDados((antigo) => ({ ...antigo, [campo]: valor }));
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(todosErros)) return;

    const corpo = {
      identification: dados.identification.trim(),
      brand: dados.brand.trim(),
      model: dados.model.trim(),
      category: dados.category.trim(),
      manufacture_year: lerNumero(dados.manufacture_year),
      current_hour_meter: lerNumero(dados.current_hour_meter),
      maintenance_interval: lerNumero(dados.maintenance_interval),
    };

    setEnviando(true);
    setErroEnvio("");
    try {
      if (equipamento) {
        await requisitar(`/api/equipments/${equipamento.id}`, { metodo: "PATCH", corpo });
        aoSalvar(`Equipamento ${corpo.identification} atualizado.`);
      } else {
        await requisitar("/api/equipments", {
          metodo: "POST",
          corpo: { ...corpo, property_id: dados.property_id.trim() },
        });
        aoSalvar(`Equipamento ${corpo.identification} cadastrado.`);
      }
    } catch (erro) {
      setErroEnvio(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo={equipamento ? "Editar equipamento" : "Novo equipamento"}
      aoFechar={enviando ? () => {} : aoCancelar}
      largura="max-w-2xl"
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <p className="text-xs text-gray-600">Campos com * são obrigatórios.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoTexto
            id="identification"
            rotulo="Identificação"
            obrigatorio
            dica="Ex.: TR-01 ou placa/chassi"
            value={dados.identification}
            onChange={mudar("identification")}
            erro={erros.identification}
            disabled={enviando}
            autoFocus
          />

          <CampoTexto
            id="category"
            rotulo="Categoria"
            obrigatorio
            list="categorias-equipamento"
            value={dados.category}
            onChange={mudar("category")}
            erro={erros.category}
            disabled={enviando}
            autoComplete="off"
          />
          <datalist id="categorias-equipamento">
            {CATEGORIAS_SUGERIDAS.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>

          <CampoTexto
            id="brand"
            rotulo="Marca"
            obrigatorio
            value={dados.brand}
            onChange={mudar("brand")}
            erro={erros.brand}
            disabled={enviando}
          />

          <CampoTexto
            id="model"
            rotulo="Modelo"
            obrigatorio
            value={dados.model}
            onChange={mudar("model")}
            erro={erros.model}
            disabled={enviando}
          />

          <CampoTexto
            id="manufacture_year"
            rotulo="Ano de fabricação"
            obrigatorio
            inputMode="numeric"
            value={dados.manufacture_year}
            onChange={mudar("manufacture_year")}
            erro={erros.manufacture_year}
            disabled={enviando}
          />

          <CampoTexto
            id="current_hour_meter"
            rotulo={equipamento ? "Horímetro atual (h)" : "Horímetro inicial (h)"}
            obrigatorio
            inputMode="decimal"
            value={dados.current_hour_meter}
            onChange={mudar("current_hour_meter")}
            erro={erros.current_hour_meter}
            disabled={enviando}
          />

          <CampoTexto
            id="maintenance_interval"
            rotulo="Intervalo de manutenção (h)"
            obrigatorio
            inputMode="decimal"
            dica="A cada quantas horas de uso a máquina precisa de manutenção."
            value={dados.maintenance_interval}
            onChange={mudar("maintenance_interval")}
            erro={erros.maintenance_interval}
            disabled={enviando}
          />

          {/* A propriedade só é escolhida no cadastro; a API não permite trocá-la depois */}
          {!equipamento && (
            <CampoReferencia
              id="property_id"
              rotulo="Propriedade"
              obrigatorio
              opcoes={propriedades}
              carregando={carregandoPropriedades}
              valor={dados.property_id}
              aoMudar={(valor) => setDados((antigo) => ({ ...antigo, property_id: valor }))}
              erro={erros.property_id}
            />
          )}
        </div>

        {erroEnvio && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {erroEnvio}
          </p>
        )}
        {tentou && temErros(todosErros) && (
          <p className="text-sm text-red-700">Corrija os campos destacados para continuar.</p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <Botao onClick={aoCancelar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="primario" disabled={enviando}>
            {enviando ? "Salvando..." : "Salvar"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
