"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const path = usePathname();

  return (
    <main className="flex min-h-screen bg-white">
      <aside
        className="relative hidden min-h-screen flex-1 bg-primary bg-cover bg-center text-white lg:flex"
        style={{ backgroundImage: "url('/lavroura.png')" }}
      >
        <div className="absolute inset-0 bg-green-950/70 backdrop-blur-xs" />

        <div className="relative z-10 flex flex-1 flex-col p-12 xl:p-16">
          <Link
            href="/"
            className="w-fit font-['ui-rounded'] text-xl font-bold"
          >
            AgroGestão
          </Link>

          <div className="my-auto flex max-w-2xl flex-col gap-5 py-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-300">
              Tecnologia aplicada ao campo
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Tecnologia e inteligência para o agronegócio moderno.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-neutral-200 xl:text-lg">
              Acelere tomadas de decisão agronômicas com sensoriamento remoto de
              alta resolução, automação de frotas e previsão climática
              micrometeorológica.
            </p>
          </div>

          <footer className="flex flex-wrap justify-between gap-3 border-t border-white/20 pt-5 text-sm text-neutral-300">
            <span>Criptografia SSL/TLS</span>
            <span>Conformidade com a LGPD</span>
          </footer>
        </div>
      </aside>
      <section
        className={`flex min-h-screen w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-7/12 lg:flex-none transition-all ${path === "/auth/register" ? "xl:w-1/2" : "xl:w-2/5"}`}
      >
        <div className="w-full max-w-3xl">{children}</div>
      </section>
    </main>
  );
}
