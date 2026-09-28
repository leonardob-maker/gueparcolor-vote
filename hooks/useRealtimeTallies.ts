"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchTallies } from "@/app/actions";
import type { Tally } from "@/types";

type ConnectionState = "connecting" | "live" | "offline";

/**
 * Mantém o placar sincronizado.
 *
 * Estratégia:
 *  - o servidor entrega o estado inicial (sem flash de tela vazia);
 *  - o canal Realtime escuta INSERT/UPDATE em `vote_tallies`;
 *  - se o socket cair, um polling de 20s assume até a reconexão.
 */
export function useRealtimeTallies(initial: Tally[]) {
  const [tallies, setTallies] = useState<Tally[]>(initial);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const talliesRef = useRef(tallies);
  talliesRef.current = tallies;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const applyRow = (row: Tally) => {
      setTallies((current) => {
        const next = current.filter((t) => t.option_id !== row.option_id);
        return [...next, row];
      });
    };

    const channel = supabase
      .channel("placar-gueparcolor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vote_tallies" },
        (payload: RealtimePostgresChangesPayload<Tally>) => {
          const row = payload.new as Tally | undefined;
          if (row?.option_id) applyRow(row);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnection("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection("offline");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Rede de segurança: sem socket ativo, busca o placar periodicamente.
  useEffect(() => {
    if (connection === "live") return;
    const id = setInterval(async () => {
      const fresh = await fetchTallies();
      if (fresh.length) setTallies(fresh);
    }, 20_000);
    return () => clearInterval(id);
  }, [connection]);

  const byOption = useMemo(
    () => new Map(tallies.map((t) => [t.option_id, t.total])),
    [tallies],
  );

  const total = useMemo(
    () => tallies.reduce((sum, t) => sum + t.total, 0),
    [tallies],
  );

  const leaderId = useMemo(() => {
    if (!total) return null;
    return [...tallies].sort((a, b) => b.total - a.total)[0]?.option_id ?? null;
  }, [tallies, total]);

  return { byOption, total, leaderId, connection };
}
