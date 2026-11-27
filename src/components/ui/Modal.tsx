"use client";

// Janela por cima da página. Fecha com a tecla Esc (RNF-015).
// Não fecha ao clicar fora, para ninguém perder o que já digitou (RNF-017).

import { useEffect, useId, useRef } from "react";

type Props = {
  titulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
  largura?: string; 
};

export default function Modal({ titulo, aoFechar, children, largura = "max-w-lg" }: Props) {
  const idTitulo = useId();
  const caixa = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    caixa.current?.focus();
  }, []);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl outline-none sm:rounded-xl sm:p-6 ${largura}`}
      >
        <h2 id={idTitulo} className="mb-5 text-xl font-semibold text-primary">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
