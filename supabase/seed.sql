-- ===========================================================================
--  Seed idempotente: safe to run multiple times
-- ===========================================================================

insert into public.vote_options (id, name, position) values
  ('grafite-neon',      'Grafite Neon',      1),
  ('mascote-classico',  'Mascote Clássico',  2),
  ('risco-fosco',       'Risco Fosco',       3),
  ('minimal-branco',    'Minimal Branco',    4),
  ('faca-voce-mesmo',   'Toda Ideia Merece Cor', 5)
on conflict (id) do update
  set name = excluded.name,
      position = excluded.position,
      is_active = true;

insert into public.vote_tallies (option_id)
select id from public.vote_options
on conflict (option_id) do nothing;
