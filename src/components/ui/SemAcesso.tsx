// Mostrado quando o perfil do usuário não pode ver a tela

import { FiLock } from "react-icons/fi";

export default function SemAcesso({ tela }: { tela: string }) {
  return (
    <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-lg border border-[#bdc7b9] bg-white p-8 text-center shadow-sm">
      <FiLock className="text-3xl text-[#536052]" aria-hidden="true" />
      <h1 className="text-xl font-bold text-primary">Acesso restrito</h1>
      <p className="text-sm text-[#536052]">Seu perfil não tem permissão para acessar {tela}.</p>
    </div>
  );
}
