/**
 * Diagnóstico da configuração do Supabase.
 *
 *   npm run verificar
 *
 * Roda seis checagens e diz exatamente o que fazer quando alguma falha.
 * Não grava nada no banco — exceto uma tentativa de escrita que PRECISA ser
 * bloqueada, que é justamente como provamos que o RLS está protegendo os e-mails.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- carrega .env.local sem dependência externa --------------------------------
try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // Sem .env.local? A checagem 1 avisa.
}

const EXPECTED_OPTIONS = [
  "grafite-neon",
  "mascote-classico",
  "risco-fosco",
  "minimal-branco",
  "faca-voce-mesmo",
];

let failures = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg, hint) => {
  failures++;
  console.log(`  FALHA ${msg}`);
  if (hint) console.log(`        → ${hint}`);
};

console.log("\nVerificando a configuração do GueparColor\n");

// --- 1. variáveis de ambiente --------------------------------------------------
console.log("1. Variáveis de ambiente");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
]) {
  if (value) ok(`${name} definida`);
  else fail(`${name} ausente`, "copie de .env.example para .env.local e preencha");
}

if (!url || !anonKey || !serviceKey) {
  console.log("\nSem as três chaves não dá para continuar.\n");
  process.exit(1);
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// --- 2. tabelas criadas --------------------------------------------------------
console.log("\n2. Tabelas");
const { data: options, error: optionsError } = await anon
  .from("vote_options")
  .select("id, name")
  .order("position");

if (optionsError) {
  fail(`vote_options inacessível (${optionsError.message})`, "rode supabase/schema.sql no SQL Editor");
} else {
  ok(`vote_options acessível com ${options.length} opção(ões)`);
}

// --- 3. seed sincronizado com o config -----------------------------------------
console.log("\n3. Opções cadastradas");
const ids = new Set((options ?? []).map((o) => o.id));
for (const id of EXPECTED_OPTIONS) {
  if (ids.has(id)) ok(id);
  else fail(`${id} não existe no banco`, "rode supabase/seed.sql");
}

// --- 4. placar pronto ----------------------------------------------------------
console.log("\n4. Placar");
const { data: tallies, error: talliesError } = await anon
  .from("vote_tallies")
  .select("option_id, total");

if (talliesError) {
  fail(`vote_tallies inacessível (${talliesError.message})`, "confira a policy de select em vote_tallies");
} else {
  const total = tallies.reduce((sum, t) => sum + t.total, 0);
  ok(`${tallies.length} linha(s) no placar, ${total} voto(s) no total`);
  const semLinha = EXPECTED_OPTIONS.filter((id) => !tallies.some((t) => t.option_id === id));
  if (semLinha.length) {
    fail(`sem linha de placar: ${semLinha.join(", ")}`, "rode de novo o final do seed.sql");
  }
}

// --- 5. RLS protegendo os e-mails ----------------------------------------------
console.log("\n5. Proteção dos e-mails (RLS)");
const { error: leakError } = await anon.from("votes").select("email").limit(1);
const { error: writeError } = await anon
  .from("votes")
  .insert({ option_id: EXPECTED_OPTIONS[0], email: "teste-rls@exemplo.invalid" });

if (leakError || writeError) {
  ok("a chave pública não lê nem grava na tabela votes");
} else {
  fail(
    "a chave pública conseguiu escrever em votes",
    "rode: alter table public.votes enable row level security; e remova policies permissivas",
  );
  await admin.from("votes").delete().eq("email", "teste-rls@exemplo.invalid");
}

// --- 6. Realtime ---------------------------------------------------------------
console.log("\n6. Realtime");
const status = await new Promise((resolve) => {
  const timer = setTimeout(() => resolve("TIMEOUT"), 10_000);
  const channel = anon
    .channel("verificacao-setup")
    .on("postgres_changes", { event: "*", schema: "public", table: "vote_tallies" }, () => {})
    .subscribe((s) => {
      if (s === "SUBSCRIBED" || s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        clearTimeout(timer);
        anon.removeChannel(channel);
        resolve(s);
      }
    });
});

if (status === "SUBSCRIBED") {
  ok("canal de tempo real conectado em vote_tallies");
} else {
  fail(
    `não foi possível assinar o canal (${status})`,
    "rode: alter publication supabase_realtime add table public.vote_tallies;",
  );
}

// --- resultado -----------------------------------------------------------------
console.log(
  failures === 0
    ? "\nTudo certo. Pode rodar npm run dev e votar.\n"
    : `\n${failures} item(ns) para resolver. As dicas acima apontam o caminho.\n`,
);

process.exit(failures === 0 ? 0 : 1);
