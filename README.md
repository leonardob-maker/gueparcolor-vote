# GueparColor · Votação da nova embalagem

Landing page de votação pública construída em **Next.js 15 (App Router)**, **Tailwind CSS v4** e **Supabase**, pronta para deploy na Vercel.

Um e-mail, um voto — garantido pelo banco, não pela interface. O placar atualiza ao vivo via Supabase Realtime.

---

## 1. Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

Abra `http://localhost:3000`.

## 2. Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode na ordem:
   - `supabase/schema.sql` (ou `supabase/schema-idempotent.sql` se der erro de 'already member of publication') — tabelas, índice único, trigger de placar, RLS e Realtime
   - `supabase/seed.sql` — cadastra as cinco opções
3. Em **Project Settings → API**, copie para o `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha no client)
4. Em **Database → Replication**, confirme que `vote_tallies` está na publicação `supabase_realtime`.

## 2b. Conferindo se o Supabase ficou de pé

```bash
npm run verificar
```

O script roda seis checagens contra o seu projeto e, quando algo falha, imprime o comando que resolve. Ele confere: as três variáveis de ambiente, se as tabelas existem, se as cinco opções foram cadastradas, se o placar tem uma linha por opção, se o RLS realmente bloqueia a chave pública na tabela `votes` e se o canal de tempo real conecta.

A checagem de RLS tenta de propósito gravar um voto com a chave pública. Se a gravação passar, é sinal de que a proteção não está ativa — o script avisa e remove o registro de teste.

## 2c. VS Code

O projeto já vem com `.vscode/` configurado:

- **extensions.json** — ao abrir a pasta, o VS Code oferece as extensões recomendadas (Tailwind IntelliSense, ESLint, Prettier, Pretty TS Errors e SQLTools para consultar o Postgres direto do editor).
- **settings.json** — desliga o alerta de "regra @ desconhecida" que o Tailwind v4 provoca no `globals.css`, liga o autocomplete de classes dentro de arrays e força o uso do TypeScript do projeto.
- **launch.json** — `F5` sobe o `npm run dev` e abre o Chrome já conectado ao debugger, com breakpoints funcionando tanto no Server Component quanto na Server Action.

Se o autocomplete do Tailwind não aparecer logo de cara, abra a paleta (`Ctrl/Cmd + Shift + P`) e rode **Developer: Reload Window** — a extensão só varre o `globals.css` na inicialização.

## 3. Deploy na Vercel

```bash
vercel
```

Cadastre as quatro variáveis do `.env.example` em **Settings → Environment Variables** (Production e Preview). A `SUPABASE_SERVICE_ROLE_KEY` fica sem o prefixo `NEXT_PUBLIC_`, então só existe no runtime do servidor.

---

## 4. Como a integridade dos votos é garantida

A regra "um voto por e-mail" vive em **quatro camadas**, da mais forte para a mais fraca:

| Camada | Onde | O que faz |
| --- | --- | --- |
| Índice único | `votes.email_key` (coluna gerada: `lower(btrim(email))`) | Impossibilita o segundo voto, mesmo em requisições simultâneas. `Ana@Mail.com ` e `ana@mail.com` são a mesma pessoa. |
| Leitura prévia | Server Action | Devolve a mensagem amigável antes de tentar gravar. |
| Rate limit por IP | Server Action | Máximo de `VOTES_PER_IP_PER_HOUR` votos por conexão, usando hash salgado do IP (o IP puro nunca é armazenado). |
| Honeypot + zod | Formulário e Server Action | Corta bots simples e e-mails descartáveis. |

A contagem nunca é somada no cliente: um **trigger** no Postgres incrementa `vote_tallies` dentro da mesma transação do voto. Se o insert falhar, o placar não se move.

**Privacidade:** a tabela `votes` tem RLS ligada e nenhuma policy — a chave pública não lê, escreve nem apaga nada ali. O público só enxerga `vote_options` e `vote_tallies`, que não contêm e-mails.

> Para campanhas com premiação, adicione confirmação por link enviado no e-mail (double opt-in) antes de contabilizar. A estrutura já está pronta: basta criar a coluna `confirmed_at` e filtrar o trigger por ela.

## 5. Tempo real

`hooks/useRealtimeTallies.ts` assina `postgres_changes` na tabela `vote_tallies`. Se o socket cair, um polling de 20 segundos assume até a reconexão, e o indicador ao lado do total muda de "atualizando ao vivo" para "reconectando". O primeiro render vem do servidor, então não existe tela vazia.

---

## 6. Personalizando

Praticamente tudo o que o marketing precisa mudar está em **`config/campaign.ts`**: títulos, subtítulos, textos dos botões, mensagens de erro e sucesso, links do rodapé e as cinco opções.

**Trocar uma imagem de embalagem**

1. Coloque o arquivo em `public/embalagens/` (WEBP ou PNG com fundo transparente, lata frontal centralizada, ~1100px de altura).
2. Aponte o campo `image` da opção para o novo caminho.
3. Não mude o `id` — ele é a chave do placar no banco. Mudar o id zera os votos daquela opção.

As imagens em `public/embalagens/` já são os **mockups reais das cinco propostas**: a lata frontal foi recortada da composição frente/verso, o fundo branco virou transparência e a altura foi normalizada em 1100px. Ficaram em WebP (28–69 KB cada, contra ~470 KB em PNG), servidas pelo `next/image` com `object-contain`, então latas de larguras diferentes alinham pela mesma altura no grid.

**Adicionar ou remover uma opção**

Edite o array `options` em `config/campaign.ts` e rode `supabase/seed.sql` de novo com os ids atualizados. O grid se adapta sozinho.

**Mudar a identidade visual**

Os tokens ficam no bloco `@theme` de `app/globals.css`. Trocar `--color-spray` ou `--font-display` repagina a página inteira.

**Variáveis de comportamento**

- `NEXT_PUBLIC_VOTING_DEADLINE` — ativa a contagem regressiva e bloqueia votos após a data. Vazio = sem prazo.
- `NEXT_PUBLIC_SHOW_LIVE_RESULTS` — `false` esconde o placar até a pessoa votar (evita efeito manada).
- `VOTES_PER_IP_PER_HOUR` — teto do rate limit.

---

## 7. Estrutura

```
app/
  actions.ts        Server Actions: submitVote e fetchTallies
  page.tsx          Server Component; entrega o placar inicial
  globals.css       Tokens da marca, texturas e animações
components/
  sections/         Hero, VoteSection, HowItWorks, SiteFooter
  ui/               OptionCard, Countdown, Marks (SVGs inline)
config/campaign.ts  Todo o conteúdo editável
hooks/              useRealtimeTallies
lib/
  supabase/         clientes browser, server (anon) e admin (service role)
  validation.ts     schema zod, bloqueio de descartáveis, janela de votação
supabase/           schema.sql e seed.sql
```

## 8. Acessibilidade e performance

Os cards são um grupo de `radio` real, navegável por teclado e legível por leitor de tela. O foco tem contorno visível em amarelo, o placar usa `aria-live`, as animações respeitam `prefers-reduced-motion` e não há dependência de biblioteca de animação — o bundle client é basicamente React + supabase-js.

## 9. Consultando o resultado

```sql
select o.name, t.total,
       round(100.0 * t.total / nullif(sum(t.total) over (), 0), 1) as percentual
from public.vote_tallies t
join public.vote_options o on o.id = t.option_id
order by t.total desc;
```

Para exportar a base de e-mails que autorizou contato:

```sql
select email, display_name, created_at
from public.votes
where consent_marketing
order by created_at;
```
