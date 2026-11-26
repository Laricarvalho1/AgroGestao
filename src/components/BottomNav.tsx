// Barra inferior do celular

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdClose, MdMenu } from "react-icons/md";
import { MENUS, PERFIL_ATUAL, estaAtivo } from "./menus";

export default function BottomNav() {
  const caminhoAtual = usePathname();
  const [maisAberto, setMaisAberto] = useState(false);
  const itens = MENUS[PERFIL_ATUAL];

  // Até 4 itens cabem na barra. Se tiver mais, mostra 3 + o botão "Mais".
  const temMais = itens.length > 4;
  const itensNaBarra = temMais ? itens.slice(0, 3) : itens;
  const itensNoMais = temMais ? itens.slice(3) : [];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-200 bg-white md:hidden">
        {itensNaBarra.map((item) => {
          const Icone = item.icone;
          const ativo = estaAtivo(item.href, caminhoAtual);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                ativo ? "font-semibold text-primary" : "text-neutral-500"
              }`}
            >
              <Icone size={24} />
              {item.rotulo}
            </Link>
          );
        })}

        {temMais && (
          <button
            onClick={() => setMaisAberto(true)}
            className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2 text-xs text-neutral-500"
          >
            <MdMenu size={24} />
            Mais
          </button>
        )}
      </nav>

      {/* Gaveta que abre ao clicar em "Mais" */}
      {maisAberto && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMaisAberto(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-lg font-semibold">Mais opções</span>
              <button onClick={() => setMaisAberto(false)} className="cursor-pointer p-2">
                <MdClose size={24} />
              </button>
            </div>

            {itensNoMais.map((item) => {
              const Icone = item.icone;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMaisAberto(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base text-neutral-700 hover:bg-neutral-100"
                >
                  <Icone size={22} />
                  {item.rotulo}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
