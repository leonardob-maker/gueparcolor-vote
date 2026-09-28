import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/** Leitura no servidor com anon key — respeita RLS. Use para render da página. */
export function createSupabaseServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Cliente administrativo (service role). Ignora RLS, então só pode ser
 * importado em Server Actions / Route Handlers — nunca em componente client.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente. Configure a variável de ambiente antes de gravar votos.",
    );
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
