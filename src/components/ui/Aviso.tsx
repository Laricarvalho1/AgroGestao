// Mensagem de retorno depois de uma operação 

import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

type Props = {
  tipo: "sucesso" | "erro";
  children: React.ReactNode;
  aoFechar?: () => void;
};

export default function Aviso({ tipo, children, aoFechar }: Props) {
  const sucesso = tipo === "sucesso";
  const Icone = sucesso ? FiCheckCircle : FiAlertCircle;

  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
        sucesso ? "border-green-300 bg-green-50 text-green-900" : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      <Icone className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
      {aoFechar && (
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar aviso"
          className="-m-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-black/5"
        >
          <FiX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
