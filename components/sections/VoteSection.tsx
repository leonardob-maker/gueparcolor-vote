"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitVote } from "@/app/actions";
import { campaign, optionsById, showLiveResults } from "@/config/campaign";
import { useRealtimeTallies } from "@/hooks/useRealtimeTallies";
import { OptionCard } from "@/components/ui/OptionCard";
import { CheckMark, Splatter } from "@/components/ui/Marks";
import type { Tally, VoteFormState } from "@/types";

const initialState: VoteFormState = { status: "idle" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="sticker w-full rounded-full border-asphalt bg-spray px-8 py-4 font-display text-xl text-asphalt transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:w-auto"
    >
      {pending ? campaign.vote.submittingLabel : campaign.vote.submitLabel}
    </button>
  );
}

export function VoteSection({ initialTallies }: { initialTallies: Tally[] }) {
  const [state, formAction] = useActionState(submitVote, initialState);
  const [selected, setSelected] = useState<string | null>(null);
  const { byOption, total, leaderId, connection } = useRealtimeTallies(initialTallies);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const voted = state.status === "success";
  const revealResults = showLiveResults || voted;

  useEffect(() => {
    if (voted) confirmationRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [voted]);

  const percents = useMemo(() => {
    const map = new Map<string, number>();
    for (const option of campaign.options) {
      const votes = byOption.get(option.id) ?? 0;
      map.set(option.id, total ? Math.round((votes / total) * 100) : 0);
    }
    return map;
  }, [byOption, total]);

  const chosen = state.status === "success" ? optionsById.get(state.optionId) : null;

  return (
    <section id="votacao" className="relative overflow-hidden bg-paper py-20 lg:py-28">
      <Splatter className="pointer-events-none absolute -left-24 top-32 h-72 w-72 text-spray/25" />

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="max-w-2xl">
          <h2 className="text-[clamp(2.25rem,5.5vw,3.75rem)]">
            Qual é a sua{" "}
            <span className="marker" style={{ "--marker-color": "var(--color-spray)" } as React.CSSProperties}>
              favorita
            </span>
            ?
          </h2>
          <p className="mt-5 max-w-[52ch] text-asphalt/70">{campaign.vote.description}</p>
        </header>

        {revealResults && total > 0 ? (
          <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-asphalt/60">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connection === "live" ? "animate-live-dot bg-cap" : "bg-asphalt/30"
              }`}
              aria-hidden="true"
            />
            {total} {total === 1 ? "voto registrado" : "votos registrados"}
            {connection === "live" ? " · placar atualizando ao vivo" : " · reconectando"}
          </p>
        ) : null}

        <form action={formAction} className="mt-10">
          <fieldset disabled={voted} className="contents">
            <legend className="sr-only">Escolha uma das cinco embalagens</legend>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selected === option.id}
                  disabled={voted}
                  votes={byOption.get(option.id) ?? 0}
                  percent={percents.get(option.id) ?? 0}
                  isLeader={leaderId === option.id && total > 0}
                  showResults={revealResults}
                  onSelect={setSelected}
                />
              ))}
            </div>

            {!voted ? (
              <div className="tape relative mt-12 rounded-sticker border-3 border-asphalt bg-white p-6 shadow-lift sm:p-9">
                <h3 className="text-2xl">Confirme seu voto</h3>
                <p className="mt-2 max-w-[48ch] text-sm text-asphalt/65">
                  Usamos seu e-mail só para garantir um voto por pessoa e avisar o resultado.
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold">
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="voce@email.com"
                      aria-describedby={state.status === "error" ? "vote-feedback" : undefined}
                      aria-invalid={state.status === "error" && state.field === "email"}
                      className="mt-2 w-full rounded-lg border-2 border-asphalt/20 bg-paper px-4 py-3 text-base outline-none transition-colors focus:border-asphalt"
                    />
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-semibold">
                      Nome <span className="font-normal text-asphalt/50">(opcional)</span>
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      placeholder="Como podemos te chamar"
                      className="mt-2 w-full rounded-lg border-2 border-asphalt/20 bg-paper px-4 py-3 text-base outline-none transition-colors focus:border-asphalt"
                    />
                  </div>
                </div>

                {/* Campo isca: invisível para pessoas, irresistível para bots. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <label className="mt-6 flex items-start gap-3 text-sm text-asphalt/75">
                  <input
                    type="checkbox"
                    name="consentMarketing"
                    className="mt-1 h-4 w-4 accent-asphalt"
                  />
                  <span>{campaign.vote.consentLabel}</span>
                </label>

                {state.status === "error" ? (
                  <p
                    id="vote-feedback"
                    role="alert"
                    className="mt-6 rounded-lg border-2 border-cap bg-cap/8 px-4 py-3 text-sm font-semibold text-cap"
                  >
                    {state.message}
                  </p>
                ) : null}

                {!selected ? (
                  <p className="mt-6 text-sm text-asphalt/55">
                    Escolha uma embalagem acima para liberar o botão.
                  </p>
                ) : null}

                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <SubmitButton disabled={!selected} />
                  <p className="max-w-[40ch] text-xs text-asphalt/50">{campaign.vote.legal}</p>
                </div>
              </div>
            ) : null}
          </fieldset>
        </form>

        {voted && chosen ? (
          <div
            ref={confirmationRef}
            className="animate-spray-in mt-12 flex flex-col items-start gap-5 rounded-sticker border-3 border-asphalt bg-asphalt p-8 text-paper sm:flex-row sm:items-center sm:p-10"
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: chosen.accent }}
            >
              <CheckMark className="h-7 w-7 text-asphalt" />
            </span>
            <div>
              <h3 className="text-3xl">{campaign.vote.successTitle}</h3>
              <p className="mt-2 max-w-[52ch] text-paper/75">
                Você escolheu <strong className="text-spray">{chosen.name}</strong>.{" "}
                {campaign.vote.successBody}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
