"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { VoteOption } from "@/config/campaign";
import { CheckMark, NumberTag } from "@/components/ui/Marks";

type Props = {
  option: VoteOption;
  selected: boolean;
  disabled: boolean;
  votes: number;
  percent: number;
  isLeader: boolean;
  showResults: boolean;
  onSelect: (id: string) => void;
};

export function OptionCard({
  option,
  selected,
  disabled,
  votes,
  percent,
  isLeader,
  showResults,
  onSelect,
}: Props) {
  const dark = option.surface === "asphalt";
  const [bumped, setBumped] = useState(false);
  const previous = useRef(votes);

  // Pisca o contador quando um voto chega pelo Realtime.
  useEffect(() => {
    if (votes !== previous.current) {
      previous.current = votes;
      setBumped(true);
      const id = setTimeout(() => setBumped(false), 900);
      return () => clearTimeout(id);
    }
  }, [votes]);

  return (
    <label
      className={[
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-sticker border-3 transition-[transform,box-shadow] duration-200",
        dark ? "bg-asphalt text-paper" : "bg-white text-asphalt",
        selected
          ? "border-asphalt shadow-lift -translate-y-1"
          : "border-asphalt/15 hover:-translate-y-1 hover:border-asphalt/45",
        disabled ? "cursor-default" : "",
      ].join(" ")}
      style={{ borderWidth: 3, borderColor: selected ? option.accent : undefined }}
    >
      <input
        type="radio"
        name="optionId"
        value={option.id}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(option.id)}
        className="peer sr-only"
      />

      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: option.accent }}
        aria-hidden="true"
      />

      <span className="flex items-start justify-between px-5 pt-5">
        <NumberTag value={option.badge} className={dark ? "text-spray" : "text-asphalt"} />
        {isLeader && showResults ? (
          <span className="rounded-full bg-spray px-3 py-1 text-xs font-bold text-asphalt">
            na frente
          </span>
        ) : null}
      </span>

      <span className="relative mx-auto mt-1 block h-64 w-full max-w-[15rem]">
        <Image
          src={option.image}
          alt={option.alt}
          fill
          sizes="(max-width: 768px) 55vw, 260px"
          className="object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,.35)]"
        />
      </span>

      <span className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <span className="font-display text-2xl leading-none">{option.name}</span>
        <span className={`mt-2 text-sm ${dark ? "text-paper/65" : "text-asphalt/65"}`}>
          {option.pitch}
        </span>

        {showResults ? (
          <span className="mt-4 block" aria-live="polite">
            <span
              className={`flex items-baseline justify-between text-sm font-semibold ${
                bumped ? "animate-tally-pulse" : ""
              }`}
            >
              <span>{percent}%</span>
              <span className={dark ? "text-paper/55" : "text-asphalt/55"}>
                {votes} {votes === 1 ? "voto" : "votos"}
              </span>
            </span>
            <span
              className={`mt-2 block h-2.5 w-full overflow-hidden rounded-full ${
                dark ? "bg-paper/15" : "bg-asphalt/10"
              }`}
            >
              <span
                className="block h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${percent}%`, backgroundColor: option.accent }}
              />
            </span>
          </span>
        ) : null}

        <span
          className={[
            "mt-5 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
            selected
              ? "bg-asphalt text-paper"
              : dark
                ? "bg-paper/10 text-paper/75 group-hover:bg-paper/20"
                : "bg-asphalt/8 text-asphalt/70 group-hover:bg-asphalt/15",
          ].join(" ")}
          style={selected ? { backgroundColor: option.accent, color: "#101010" } : undefined}
        >
          {selected ? (
            <>
              <CheckMark className="h-4 w-4" />
              Selecionada
            </>
          ) : (
            "Escolher esta"
          )}
        </span>
      </span>
    </label>
  );
}
