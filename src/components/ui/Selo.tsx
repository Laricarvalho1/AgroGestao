// Etiqueta de situação

import { FiAlertTriangle, FiCheckCircle, FiMinusCircle, FiXCircle } from "react-icons/fi";

export type Tom = "verde" | "amarelo" | "vermelho" | "cinza";

const estilos: Record<Tom, { classe: string; Icone: typeof FiCheckCircle }> = {
  verde: { classe: "bg-green-100 text-green-900", Icone: FiCheckCircle },
  amarelo: { classe: "bg-amber-100 text-amber-900", Icone: FiAlertTriangle },
  vermelho: { classe: "bg-red-100 text-red-900", Icone: FiXCircle },
  cinza: { classe: "bg-gray-100 text-gray-800", Icone: FiMinusCircle },
};

export default function Selo({ tom, texto }: { tom: Tom; texto: string }) {
  const { classe, Icone } = estilos[tom];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      <Icone aria-hidden="true" />
      {texto}
    </span>
  );
}
