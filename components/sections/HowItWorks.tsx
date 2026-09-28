import { campaign } from "@/config/campaign";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="asphalt-grain relative overflow-hidden py-20 text-paper lg:py-24">
      <div className="halftone pointer-events-none absolute inset-0 text-paper" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-6">
        <h2 className="max-w-xl text-[clamp(2rem,4.5vw,3rem)]">Como funciona</h2>

        {/* É uma sequência real de três passos, então a numeração carrega informação. */}
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {campaign.howItWorks.map((step, index) => (
            <li key={step.title} className="border-t-4 border-spray pt-5">
              <span className="font-display text-5xl text-spray">{index + 1}</span>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-paper/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
