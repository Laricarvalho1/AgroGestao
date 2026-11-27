// Cartão de número no topo das telas 

type Props = {
  titulo: string;
  valor: string;
  detalhe?: string;
  tom?: "verde" | "amarelo" | "vermelho";
};

const borda = {
  verde: "border-t-primary",
  amarelo: "border-t-amber-500",
  vermelho: "border-t-red-600",
};

export default function CartaoIndicador({ titulo, valor, detalhe, tom = "verde" }: Props) {
  return (
    <article className={`rounded-lg border border-[#bdc7b9] border-t-4 bg-white p-4 shadow-sm ${borda[tom]}`}>
      <p className="text-sm">{titulo}</p>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-[#536052]">{detalhe}</p>}
    </article>
  );
}
