import Link from "next/link";

export default function NotFound() {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center text-paper">
      <h1 className="text-6xl">Página em branco</h1>
      <p className="max-w-sm text-paper/70">
        Este endereço não existe na campanha. Volte para a votação e escolha sua embalagem.
      </p>
      <Link href="/" className="sticker border-paper bg-spray px-6 py-3 font-semibold text-asphalt">
        Ir para a votação
      </Link>
    </main>
  );
}
