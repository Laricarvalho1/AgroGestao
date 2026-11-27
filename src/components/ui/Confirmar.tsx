"use client";

// Janela de confirmação para ações que não têm volta 

import { useState } from "react";
import { mensagemDoErro } from "@/lib/http";
import Botao from "./Botao";
import Modal from "./Modal";
import { CampoTextoLongo } from "./Campo";

type Props = {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  perigo?: boolean; // botão vermelho
  rotuloMotivo?: string; // se informado, exige uma justificativa
  aoConfirmar: (motivo: string) => Promise<void>; // se der erro, a mensagem aparece aqui dentro
  aoCancelar: () => void;
};

export default function Confirmar({
  titulo,
  mensagem,
  textoConfirmar,
  perigo,
  rotuloMotivo,
  aoConfirmar,
  aoCancelar,
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const erroMotivo = rotuloMotivo && motivo.trim() === "" ? "Informe a justificativa." : undefined;

  async function confirmar() {
    setTentou(true);
    if (erroMotivo) return;

    setEnviando(true);
    setErro("");
    try {
      await aoConfirmar(motivo.trim());
      // sucesso: quem chamou fecha esta janela
    } catch (e) {
      setErro(mensagemDoErro(e));
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={titulo} aoFechar={enviando ? () => {} : aoCancelar}>
      <p className="text-sm leading-relaxed text-gray-800">{mensagem}</p>

      {rotuloMotivo && (
        <div className="mt-4">
          <CampoTextoLongo
            id="motivo"
            rotulo={rotuloMotivo}
            obrigatorio
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            erro={tentou ? erroMotivo : undefined}
            disabled={enviando}
          />
        </div>
      )}

      {erro && (
        <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {erro}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <Botao onClick={aoCancelar} disabled={enviando}>
          Voltar
        </Botao>
        <Botao variante={perigo ? "destrutivo" : "primario"} onClick={confirmar} disabled={enviando}>
          {enviando ? "Processando..." : textoConfirmar}
        </Botao>
      </div>
    </Modal>
  );
}
