import AgButton from "@/components/AgButton";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex w-3/4 flex-col text-black">
      <h1 className="text-4xl font-bold">Bem-vindo ao AgroGestão</h1>
      <p className="mt-1">
        Escolha uma opção para começar a gerenciar sua operação agrícola.
      </p>

      <div className="mt-8 flex flex-col">
        <Link href="/auth/register">
          <AgButton>Registrar fazenda</AgButton>
        </Link>
        <Link
          href="/auth/login"
          className="m-1 rounded-xl border-2 border-primary py-3 text-center text-primary transition-colors hover:bg-neutral-100"
        >
          Já tenho uma conta
        </Link>
      </div>
    </div>
  );
}
