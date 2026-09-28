"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center text-paper">
      <h1 className="text-5xl">A tinta escorreu</h1>
      <p className="max-w-sm text-paper/70">
        A página não carregou como deveria. Tente de novo — seu voto ainda não foi perdido.
      </p>
      <button
        onClick={reset}
        className="sticker border-paper bg-spray px-6 py-3 font-semibold text-asphalt"
      >
        Recarregar a votação
      </button>
    </main>
  );
}
