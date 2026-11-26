// Menu lateral do computador

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENUS, PERFIL_ATUAL, estaAtivo } from "./menus";

export default function Sidebar() {
  const caminhoAtual = usePathname(); // endereço da página aberta agora
  const itens = MENUS[PERFIL_ATUAL];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-neutral-200 px-5">
        <span className="text-xl font-bold text-primary">AgroGestão</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {itens.map((item) => {
          const Icone = item.icone;
          const ativo = estaAtivo(item.href, caminhoAtual);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base transition ${
                ativo
                  ? "bg-primary font-semibold text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Icone size={22} />
              {item.rotulo}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
