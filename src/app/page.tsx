export default function Home() {
  return (
    <div className="flex flex-1">
      <div
        className="relative bg-primary w-full backdrop-blur-xs"
        style={{
          height: "100vh",
          width: "100vw",
          backgroundImage: `url('/lavroura.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute backdrop-blur-xs inset-0">
          <div className="absolute inset-0 bg-primary opacity-50"></div>
        </div>
      </div>
      <div className=" w-7/10"></div>
    </div>
  );
}
