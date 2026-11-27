// Botão padrão das telas

import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "perigo" | "destrutivo";

const estilos: Record<Variante, string> = {
  primario: "bg-primary text-white hover:bg-darker-primary",
  secundario: "border border-[#bdc7b9] bg-white text-[#202820] hover:bg-gray-100",
  perigo: "border border-red-700 bg-white text-red-800 hover:bg-red-50",
  destrutivo: "bg-red-700 text-white hover:bg-red-800",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante };

export default function Botao({ variante = "secundario", className = "", type = "button", ...resto }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 md:min-h-9 ${estilos[variante]} ${className}`}
      {...resto}
    />
  );
}
