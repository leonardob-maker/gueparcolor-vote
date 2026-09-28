import { campaign, votingDeadline } from "@/config/campaign";
import { SprayArc, Splatter } from "@/components/ui/Marks";
import { Countdown } from "@/components/ui/Countdown";

export function Hero() {
  return (
    <section className="asphalt-grain relative overflow-hidden text-paper">
      <div className="halftone pointer-events-none absolute inset-0 text-paper" aria-hidden="true" />
      <Splatter
        className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 text-cap/25 blur-[1px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 border-2 border-spray px-3 py-1 text-sm font-semibold tracking-wide text-spray">
            {campaign.brand.name} · {campaign.hero.kicker}
          </p>

          <h1 className="text-[clamp(3rem,10vw,6.75rem)]">
            {campaign.hero.headline.map((line, i) => (
              <span key={line} className="block">
                {i === 0 ? (
                  <span className="marker text-asphalt" style={{ "--marker-color": "var(--color-spray)" } as React.CSSProperties}>
                    {line}
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <SprayArc className="mt-4 h-12 w-full max-w-md text-spray" />

          <p className="mt-7 max-w-[46ch] text-lg text-paper/75">{campaign.hero.subhead}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#votacao"
              className="sticker border-asphalt bg-spray px-7 py-4 font-display text-xl text-asphalt transition-transform hover:-translate-y-0.5"
            >
              {campaign.hero.ctaPrimary}
            </a>
            <a
              href="#como-funciona"
              className="border-b-2 border-paper/40 pb-1 font-semibold text-paper/80 transition-colors hover:border-spray hover:text-spray"
            >
              {campaign.hero.ctaSecondary}
            </a>
          </div>

          {votingDeadline ? <Countdown deadline={votingDeadline.toISOString()} /> : null}
        </div>

        {/* Lata desenhada em CSS: nenhuma imagem obrigatória para o hero. */}
        <div className="relative hidden justify-self-center lg:block">
          <div className="relative h-[26rem] w-[13rem]" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-10 w-16 -translate-x-1/2 rounded-t-md bg-paper-dim" />
            <div className="absolute left-1/2 top-9 h-6 w-28 -translate-x-1/2 rounded-sm bg-cap" />
            <div className="absolute inset-x-0 top-14 bottom-0 rounded-[2rem] bg-gradient-to-b from-asphalt-soft via-asphalt to-black shadow-[inset_-18px_0_36px_rgba(0,0,0,.6),inset_18px_0_28px_rgba(255,255,255,.06)]" />
            <div className="absolute inset-x-6 top-24 rotate-90 origin-center">
              <span className="font-display text-4xl text-paper">GUEPAR</span>
              <span className="font-display text-4xl text-cap">COLOR</span>
            </div>
            <div className="absolute bottom-8 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-spray/70" />
          </div>
          <SprayArc className="absolute -left-16 top-24 h-24 w-56 -rotate-12 text-rust/70" />
        </div>
      </div>
    </section>
  );
}
