// Junta o menu lateral para computador, a barra inferior para o celular e o conteudo da pagina

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function LayoutSistema({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <BottomNav />
      {/* md:ml-64 abre espaço para o menu lateral; pb-24 para a barra inferior */}
      <main className="p-4 pb-24 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
