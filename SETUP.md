# Setup do GueparColor — Supabase + VS Code

## Se ficou com medo de rodar schema.sql

Se viu um erro de "relation already member of publication", não se preocupa. Rode isto:

### No Supabase SQL Editor

**Query 1:** Cole `supabase/schema-idempotent.sql` e clique **Run**.  
**Query 2:** Cole `supabase/seed.sql` e clique **Run**.  
**Query 3:** Rode isto para conferir:

```sql
select o.id, o.name, t.total
from public.vote_options o
left join public.vote_tallies t on t.option_id = o.id
order by o.position;
```

Deve retornar 5 linhas com `total = 0`.

### No VS Code

```bash
npm install
cp .env.example .env.local
# abra .env.local e cole as 3 chaves do Supabase
npm run verificar
npm run dev
```

Se `npm run verificar` passar em todas as 6 checagens, tá pronto. Se falhar em "RLS", ping.

## Checklist

- [ ] Projeto Supabase criado em São Paulo
- [ ] `schema-idempotent.sql` rodado
- [ ] `seed.sql` rodado
- [ ] 5 opções aparecem no SELECT acima
- [ ] 3 chaves copiadas para `.env.local`
- [ ] `npm run verificar` passou em tudo
- [ ] `npm run dev` rodando em `http://localhost:3000`
- [ ] Consegui votar e vejo a mensagem de sucesso
- [ ] Tentei votar de novo e tomei "já votou"
