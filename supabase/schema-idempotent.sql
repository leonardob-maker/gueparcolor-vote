-- ===========================================================================
--  Versão idempotente do schema: seguro rodar quantas vezes quiser.
--  Use esta se estiver reconfigurando ou se "ficou com medo" de rodar schema.sql
-- ===========================================================================

create extension if not exists pgcrypto;

create table if not exists public.vote_options (
  id          text primary key,
  name        text not null,
  position    int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.vote_tallies (
  option_id   text primary key references public.vote_options(id) on delete cascade,
  total       int  not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  option_id   text not null references public.vote_options(id) on delete restrict,
  email       text not null,
  email_key   text generated always as (lower(btrim(email))) stored,
  display_name text,
  consent_marketing boolean not null default false,
  ip_hash     text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

drop index if exists votes_email_key_uidx;
create unique index votes_email_key_uidx
  on public.votes (email_key);

drop index if exists votes_ip_hash_created_idx;
create index votes_ip_hash_created_idx
  on public.votes (ip_hash, created_at desc);

drop trigger if exists on_vote_created on public.votes;
drop function if exists public.increment_tally();

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

create trigger on_vote_created
  after insert on public.votes
  for each row execute function public.increment_tally();

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

-- Se vote_tallies nao estiver na publicacao, adiciona (idempotente)
do $$
begin
  alter publication supabase_realtime add table public.vote_tallies;
exception when others then
  null; -- ignorar se ja existe
end
$$;

alter table public.vote_tallies replica identity full;
