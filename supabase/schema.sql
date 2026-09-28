-- ===========================================================================
--  GueparColor · Votação da nova embalagem
--  Rode este arquivo inteiro no SQL Editor do Supabase (uma única vez).
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Opções em votação
-- ---------------------------------------------------------------------------
create table if not exists public.vote_options (
  id          text primary key,
  name        text not null,
  position    int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Votos — um por e-mail, garantido pelo banco
-- ---------------------------------------------------------------------------
create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  option_id   text not null references public.vote_options(id) on delete restrict,
  email       text not null,
  -- Coluna gerada: normaliza para minúsculas e sem espaços. É ela que carrega
  -- o índice único, então "Ana@Mail.com " e "ana@mail.com" são o mesmo voto.
  email_key   text generated always as (lower(btrim(email))) stored,
  display_name text,
  consent_marketing boolean not null default false,
  ip_hash     text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create unique index if not exists votes_email_key_uidx
  on public.votes (email_key);

create index if not exists votes_ip_hash_created_idx
  on public.votes (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Placar agregado
--    Tabela separada para que o público leia o total SEM enxergar os e-mails.
-- ---------------------------------------------------------------------------
create table if not exists public.vote_tallies (
  option_id   text primary key references public.vote_options(id) on delete cascade,
  total       int  not null default 0,
  updated_at  timestamptz not null default now()
);

-- Toda opção ativa nasce com uma linha no placar (evita "buraco" na UI).
insert into public.vote_tallies (option_id)
select id from public.vote_options
on conflict (option_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Trigger: cada voto incrementa o placar na mesma transação
-- ---------------------------------------------------------------------------
create or replace function public.increment_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vote_tallies as t (option_id, total, updated_at)
  values (new.option_id, 1, now())
  on conflict (option_id)
    do update set total = t.total + 1, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_vote_created on public.votes;
create trigger on_vote_created
  after insert on public.votes
  for each row execute function public.increment_tally();

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
--    - vote_options / vote_tallies: leitura pública (anon)
--    - votes: nenhuma policy => ninguém com a anon key lê, escreve ou apaga.
--      A gravação acontece exclusivamente na Server Action, com service role.
-- ---------------------------------------------------------------------------
alter table public.vote_options  enable row level security;
alter table public.vote_tallies  enable row level security;
alter table public.votes         enable row level security;

drop policy if exists "opcoes visiveis para todos" on public.vote_options;
create policy "opcoes visiveis para todos"
  on public.vote_options for select
  to anon, authenticated
  using (is_active);

drop policy if exists "placar visivel para todos" on public.vote_tallies;
create policy "placar visivel para todos"
  on public.vote_tallies for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 6. Realtime — o front assina apenas o placar agregado
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.vote_tallies;
alter table public.vote_tallies replica identity full;

-- ---------------------------------------------------------------------------
-- 7. Consulta de checagem rápida
-- ---------------------------------------------------------------------------
-- select o.name, t.total
-- from public.vote_tallies t
-- join public.vote_options o on o.id = t.option_id
-- order by t.total desc;
