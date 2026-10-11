export default function Layout({ children }: { children: React.ReactNode }) {
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
        <div className="absolute backdrop-blur-xs inset-0 text-white ">
          <div className="absolute inset-0 bg-green-950 opacity-60 justify-between h-full" />
          <div className="absolute inset-0 justify-between mx-20">
            <div className="font-['ui-rounded'] font-bold">AgroGestão</div>

            {/*esse "h-9/10" ta esquisito, CONSERTAR DEPOIS*/}
            <div className="flex flex-col flex-1 gap-5 h-9/10 justify-center">
              <h1 className="text-5xl">
                Tecnologia e inteligência para o agronegócio moderno.
              </h1>
              <p className="text-lg text-neutral-300">
                Acelere tomadas de decisão agronômicas com sensoriamento remoto
                de alta resolução, automação de frotas e previsão climática
                micrometeorológica.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-7/10 justify-center items-center">{children}</div>
    </div>
  );
}
