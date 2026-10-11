export default function AgButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="cursor-pointer text-white text-sm m-1 w-full py-3 px-4 rounded-xl active:bg-lighter-primary hover:bg-darker-primary bg-primary transition">
      {children}
    </button>
  );
}
