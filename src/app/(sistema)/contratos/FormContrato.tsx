"use client";

// Formulário de contrato de venda (criar e editar contrato pendente).
//   POST  /api/sales-contracts        -> cria (pendente rota)
//   PATCH /api/sales-contracts/{id}   -> edita (só contrato Pendente)
//   GET   /api/sales-contracts/balance?harvest_id={id} -> saldo disponível da safra (pendente rota)

import { useEffect, useState } from "react";
import Botao from "@/components/ui/Botao";
import { CampoReferencia, CampoSelecao, CampoTexto } from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import { formatarMoeda, formatarNumero, hoje, lerNumero, numeroParaCampo } from "@/lib/formatar";
import { mensagemDoErro, requisitar } from "@/lib/http";
import type { Opcao } from "@/lib/referencias";
import { isUUID } from "@/lib/uuid";
import { erroDocumento, erroNumero, erroTexto, formatarDocumento, temErros, VALOR_MAXIMO } from "@/lib/validacao";
import { UNIDADES, type Contrato, type SaldoSafra } from "./tipos";

type Props = {
  contrato: Contrato | null;
  propriedades: Opcao[];
  carregandoPropriedades: boolean;
  safras: Opcao[];
  carregandoSafras: boolean;
  aoCancelar: () => void;
  aoSalvar: (mensagem: string) => void;
};

type Dados = {
  property_id: string;
  harvest_id: string;
  buyer: string;
  tax_id: string;
  contact: string;
  contract_date: string;
  quantity: string;
  unit: string;
  unit_price: string;
  payment_terms: string;
};

const MAXIMO_QUANTIDADE = 99999999999;
const MAXIMO_PRECO = 9999999999;

const CONDICOES_SUGERIDAS = ["À vista", "30 dias", "60 dias", "Na entrega"];

export default function FormContrato({
  contrato,
  propriedades,
  carregandoPropriedades,
  safras,
  carregandoSafras,
  aoCancelar,
  aoSalvar,
}: Props) {
  const [dados, setDados] = useState<Dados>({
    property_id: contrato?.property_id ?? "",
    harvest_id: contrato?.harvest_id ?? "",
    buyer: contrato?.buyer ?? "",
    tax_id: contrato?.tax_id ?? "",
    contact: contrato?.contact ?? "",
    contract_date: contrato?.contract_date ?? hoje(),
    quantity: contrato ? numeroParaCampo(contrato.quantity) : "",
    unit: contrato?.unit ?? "",
    unit_price: contrato ? numeroParaCampo(contrato.unit_price) : "",
    payment_terms: contrato?.payment_terms ?? "",
  });
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  // ---------- saldo disponível da safra escolhida ----------
  // Guardamos o resultado junto com o id da safra consultada. Assim, se o usuário
  // trocar de safra, o saldo antigo é ignorado automaticamente.
  const [consulta, setConsulta] = useState<{ harvestId: string; saldo: SaldoSafra | null } | null>(null);
  const harvestId = dados.harvest_id.trim();

  useEffect(() => {
    if (!isUUID(harvestId)) return;

    let cancelado = false;
    requisitar<SaldoSafra>(`/api/sales-contracts/balance?harvest_id=${harvestId}`)
      .then((saldo) => !cancelado && setConsulta({ harvestId, saldo }))
      .catch(() => !cancelado && setConsulta({ harvestId, saldo: null }));

    return () => {
      cancelado = true;
    };
  }, [harvestId]);

  const consultando = isUUID(harvestId) && consulta?.harvestId !== harvestId;
  const saldo = consulta?.harvestId === harvestId ? consulta.saldo : null;

  // Com o saldo conhecido, a unidade é a da cultura e não pode ser trocada 
  const unidade = saldo ? saldo.unit : dados.unit;

  // ---------- valor total (quantidade x preço, arredondado em centavos) ----------
  const quantidade = lerNumero(dados.quantity);
  const preco = lerNumero(dados.unit_price);
  const total = Number.isNaN(quantidade) || Number.isNaN(preco) ? null : Number((quantidade * preco).toFixed(2));

  // ---------- validação ----------
  const todosErros: Record<string, string | undefined> = {
    property_id: isUUID(dados.property_id.trim())
      ? undefined
      : dados.property_id.trim()
        ? "ID da propriedade inválido."
        : "Selecione a propriedade.",
    harvest_id: isUUID(harvestId) ? undefined : harvestId ? "ID da safra inválido." : "Selecione a safra.",
    buyer: erroTexto(dados.buyer, "o nome ou razão social do comprador", 150),
    tax_id: erroDocumento(dados.tax_id),
    contact: dados.contact.trim().length > 150 ? "Use no máximo 150 caracteres." : undefined,
    contract_date: /^\d{4}-\d{2}-\d{2}$/.test(dados.contract_date) ? undefined : "Informe a data do contrato.",
    quantity: erroNumero(dados.quantity, "a quantidade", { casas: 3, maiorQueZero: true, max: MAXIMO_QUANTIDADE }),
    unit: unidade ? undefined : "Selecione a unidade.",
    unit_price: erroNumero(dados.unit_price, "o preço unitário", { casas: 4, maiorQueZero: true, max: MAXIMO_PRECO }),
    payment_terms: erroTexto(dados.payment_terms, "a condição de pagamento", 100),
  };
  
  if (!todosErros.quantity && saldo && quantidade > saldo.available) {
    todosErros.quantity = `Quantidade maior que o saldo disponível (${formatarNumero(saldo.available, 3)} ${saldo.unit}).`;
  }
  
  if (!todosErros.quantity && !todosErros.unit_price && total !== null) {
    if (total <= 0) todosErros.unit_price = "O valor total do contrato deve ser de pelo menos R$ 0,01.";
    else if (total > VALOR_MAXIMO) todosErros.unit_price = `O valor total não pode passar de ${formatarMoeda(VALOR_MAXIMO)}.`;
  }

  const erros = tentou ? todosErros : {};

  const mudar = (campo: keyof Dados) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const valor = e.target.value;
    setDados((antigo) => ({ ...antigo, [campo]: valor }));
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(todosErros)) return;

    const corpo = {
      property_id: dados.property_id.trim(),
      harvest_id: harvestId,
      buyer: dados.buyer.trim(),
      tax_id: dados.tax_id.trim() ? formatarDocumento(dados.tax_id) : null,
      contact: dados.contact.trim() || null,
      contract_date: dados.contract_date,
      quantity: quantidade,
      unit: unidade,
      unit_price: preco,
      payment_terms: dados.payment_terms.trim(),
    };

    setEnviando(true);
    setErroEnvio("");
    try {
      if (contrato) {
        await requisitar(`/api/sales-contracts/${contrato.id}`, { metodo: "PATCH", corpo });
        aoSalvar("Contrato atualizado.");
      } else {
        await requisitar("/api/sales-contracts", { metodo: "POST", corpo });
        aoSalvar(`Contrato com ${corpo.buyer} registrado como Pendente. Confirme-o para abater do saldo da safra.`);
      }
    } catch (erro) {
      setErroEnvio(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={contrato ? "Editar contrato" : "Novo contrato de venda"} aoFechar={enviando ? () => {} : aoCancelar} largura="max-w-3xl">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <p className="text-xs text-gray-600">Campos com * são obrigatórios. Use vírgula para decimais.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <CampoReferencia
            id="harvest_id"
            rotulo="Safra"
            obrigatorio
            opcoes={safras}
            carregando={carregandoSafras}
            valor={dados.harvest_id}
            aoMudar={(valor) => setDados((antigo) => ({ ...antigo, harvest_id: valor }))}
            erro={erros.harvest_id}
          />
        </div>

        {/* Saldo disponível para venda da safra escolhida */}
        <SaldoDaSafra escolheuSafra={isUUID(harvestId)} consultando={consultando} saldo={saldo} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoTexto
            id="buyer"
            rotulo="Comprador (nome ou razão social)"
            obrigatorio
            value={dados.buyer}
            onChange={mudar("buyer")}
            erro={erros.buyer}
            disabled={enviando}
          />
          <CampoTexto
            id="tax_id"
            rotulo="CPF/CNPJ do comprador"
            inputMode="numeric"
            value={dados.tax_id}
            onChange={mudar("tax_id")}
            erro={erros.tax_id}
            disabled={enviando}
          />
          <CampoTexto
            id="contact"
            rotulo="Contato (telefone ou e-mail)"
            value={dados.contact}
            onChange={mudar("contact")}
            erro={erros.contact}
            disabled={enviando}
          />
          <CampoTexto
            id="contract_date"
            rotulo="Data do contrato"
            type="date"
            obrigatorio
            value={dados.contract_date}
            onChange={mudar("contract_date")}
            erro={erros.contract_date}
            disabled={enviando}
          />
          <CampoTexto
            id="quantity"
            rotulo="Quantidade"
            obrigatorio
            inputMode="decimal"
            value={dados.quantity}
            onChange={mudar("quantity")}
            erro={erros.quantity}
            disabled={enviando}
          />

          {saldo ? (
            <CampoTexto
              id="unit"
              rotulo="Unidade"
              obrigatorio
              value={saldo.unit}
              readOnly
              dica="Definida pela cultura da safra."
              disabled={enviando}
            />
          ) : (
            <CampoSelecao
              id="unit"
              rotulo="Unidade"
              obrigatorio
              value={dados.unit}
              onChange={mudar("unit")}
              erro={erros.unit}
              disabled={enviando}
            >
              <option value="">Selecione...</option>
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </CampoSelecao>
          )}

          <CampoTexto
            id="unit_price"
            rotulo={`Preço unitário (R$${unidade ? ` por ${unidade}` : ""})`}
            obrigatorio
            inputMode="decimal"
            value={dados.unit_price}
            onChange={mudar("unit_price")}
            erro={erros.unit_price}
            disabled={enviando}
          />
          <CampoTexto
            id="payment_terms"
            rotulo="Condição de pagamento"
            obrigatorio
            list="condicoes-pagamento"
            value={dados.payment_terms}
            onChange={mudar("payment_terms")}
            erro={erros.payment_terms}
            disabled={enviando}
            autoComplete="off"
          />
          <datalist id="condicoes-pagamento">
            {CONDICOES_SUGERIDAS.map((condicao) => (
              <option key={condicao} value={condicao} />
            ))}
          </datalist>
        </div>

        <p className="rounded-lg bg-[#f8f7f6] p-3 text-base">
          Valor total do contrato: <strong>{total === null ? "—" : formatarMoeda(total)}</strong>
        </p>

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
            {enviando ? "Salvando..." : "Salvar"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}

// Caixa com o saldo da safra 
function SaldoDaSafra({
  escolheuSafra,
  consultando,
  saldo,
}: {
  escolheuSafra: boolean;
  consultando: boolean;
  saldo: SaldoSafra | null;
}) {
  const caixa = "rounded-lg border p-3 text-sm";

  if (!escolheuSafra) {
    return <p className={`${caixa} border-gray-200 bg-gray-50 text-gray-700`}>Selecione a safra para ver o saldo disponível para venda.</p>;
  }

  if (consultando) {
    return <p className={`${caixa} border-gray-200 bg-gray-50 text-gray-700`}>Consultando saldo da safra...</p>;
  }

  if (!saldo) {
    return (
      <p role="status" className={`${caixa} border-amber-300 bg-amber-50 text-amber-900`}>
        Não foi possível consultar o saldo desta safra agora. Você pode salvar o contrato, mas o saldo será conferido na hora de
        confirmá-lo.
      </p>
    );
  }

  const semSaldo = saldo.available <= 0;

  return (
    <div role="status" className={`${caixa} ${semSaldo ? "border-red-300 bg-red-50 text-red-900" : "border-green-300 bg-green-50 text-green-900"}`}>
      <p className="font-semibold">Saldo disponível para venda</p>
      <p className="text-2xl font-bold">
        {formatarNumero(saldo.available, 3)} {saldo.unit}
      </p>
      <p className="mt-1 text-xs">
        Colhido: {formatarNumero(saldo.total_harvested, 3)} {saldo.unit} · Vendido (contratos confirmados):{" "}
        {formatarNumero(saldo.total_sold, 3)} {saldo.unit}
        {semSaldo && " · Sem saldo para novas vendas."}
      </p>
    </div>
  );
}
