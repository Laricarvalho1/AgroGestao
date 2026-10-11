import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative flex min-h-screen flex-col bg-primary bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/lavroura.png')" }}
    >
      <div className="absolute inset-0 bg-green-950/70" />

      <div className="absolute inset-0 bg-gradient-to-b from-green-950/40 via-transparent to-green-950/80" />

      <div className="relative z-10 flex flex-1 flex-col px-6 py-6 sm:px-12 lg:px-20">
        <header className="flex items-center justify-between gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            AgroGestão
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/auth/login"
              className="text-sm text-white/90 transition hover:text-white"
            >
              Entrar
            </Link>

            <Link
              href="/auth/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-50"
            >
              Cadastrar fazenda
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-green-300">
              Tecnologia aplicada ao campo
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tecnologia e inteligência para o agronegócio moderno.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Tome decisões agronômicas com dados precisos, acompanhe suas
              operações e gerencie sua fazenda em uma única plataforma.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="rounded-lg bg-green-700 px-6 py-3 text-center font-semibold transition hover:bg-green-600"
              >
                Começar agora →
              </Link>

              <Link
                href="/auth/login"
                className="rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-center font-semibold backdrop-blur-sm transition hover:bg-white/20"
              >
                Acessar minha conta
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-white/20 py-5 text-sm text-white/60 sm:flex-row">
          <p>AgroGestão · Gestão inteligente para o campo</p>

          <p>© 2026 AgroGestão. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
