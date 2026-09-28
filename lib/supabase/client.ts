"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/**
 * Cliente de browser. Usa a anon key e só enxerga o que as policies de RLS
 * permitem: as opções ativas e o placar agregado. Nunca os e-mails.
 */
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    },
  );

  return browserClient;
}
