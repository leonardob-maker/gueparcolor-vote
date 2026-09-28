"use client";

import { useEffect, useState } from "react";

function breakdown(ms: number) {
  const total = Math.max(ms, 0);
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
  };
}

export function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [target]);

  // Evita divergência entre servidor e browser: só renderiza depois de montar.
  if (remaining === null) return null;

  if (remaining <= 0) {
    return (
      <p className="mt-8 text-sm font-semibold text-paper/60">
        Votação encerrada. O resultado sai em breve.
      </p>
    );
  }

  const { days, hours, minutes } = breakdown(remaining);
  const parts = [
    { value: days, label: days === 1 ? "dia" : "dias" },
    { value: hours, label: hours === 1 ? "hora" : "horas" },
    { value: minutes, label: "min" },
  ];

  return (
    <div className="mt-9 flex items-end gap-5" aria-live="polite">
      <span className="pb-1 text-sm text-paper/55">Faltam</span>
      {parts.map((part) => (
        <span key={part.label} className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl text-spray">
            {String(part.value).padStart(2, "0")}
          </span>
          <span className="text-sm text-paper/55">{part.label}</span>
        </span>
      ))}
    </div>
  );
}
