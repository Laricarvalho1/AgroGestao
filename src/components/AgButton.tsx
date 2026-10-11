export default function AgButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="cursor-pointer text-white m-1 w-full py-3 rounded-xl active:bg-darker-primary bg-primary">
      {children}
    </button>
  );
}
