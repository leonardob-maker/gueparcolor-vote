/**
 * ============================================================================
 *  PAINEL DE CONTEÚDO DA CAMPANHA
 * ============================================================================
 *  Este é o único arquivo que o time de marketing precisa abrir para trocar
 *  textos, imagens, cores de destaque e opções de votação.
 *
 *  Para trocar uma embalagem:
 *    1. coloque o PNG/WEBP em /public/embalagens/
 *    2. atualize `image` na opção correspondente
 *    3. mantenha o `id` — ele é a chave usada no banco (mudar o id zera o placar)
 *
 *  Para adicionar ou remover uma opção, edite o array `options` e rode
 *  novamente o seed (supabase/seed.sql) para sincronizar o banco.
 * ============================================================================
 */

export type VoteOption = {
  /** Chave estável usada no Supabase. Não altere depois que a votação começar. */
  id: string;
  /** Número exibido na etiqueta desenhada sobre a lata. */
  badge: string;
  /** Nome curto do conceito, usado no card e nos resultados. */
  name: string;
  /** Uma linha explicando a ideia por trás do design. */
  pitch: string;
  /** Caminho da imagem da lata (pasta /public ou URL do Supabase Storage). */
  image: string;
  /** Texto alternativo — obrigatório para acessibilidade. */
  alt: string;
  /** Cor de apoio do card (usada no halo, na barra do placar e no foco). */
  accent: string;
  /** Fundo do card. Alterne claro/escuro para dar ritmo ao grid. */
  surface: "asphalt" | "paper";
};

export const campaign = {
  brand: {
    name: "GueparColor",
    product: "Spray Multiação 400g",
    logoAlt: "GueparColor",
    site: "https://gueparcolor.com.br",
    instagram: "https://instagram.com/gueparcolor",
  },

  hero: {
    kicker: "A nova embalagem vem aí",
    headline: ["Você escolhe", "a cara do", "próximo spray"],
    subhead:
      "Cinco conceitos saíram da prancheta. Só um vai para a prateleira. O voto é seu e vale uma lata por e-mail.",
    ctaPrimary: "Ver as cinco opções",
    ctaSecondary: "Como funciona",
    /** Imagem opcional de fundo do hero. Deixe vazio para usar só a arte em CSS. */
    backgroundImage: "",
  },

  vote: {
    title: "Qual é a sua favorita?",
    description:
      "Confira os cinco conceitos, escolha o que mais combina com você e confirme com seu e-mail. Um e-mail, um voto.",
    submitLabel: "Confirmar meu voto",
    submittingLabel: "Registrando…",
    successTitle: "Voto registrado",
    successBody:
      "Obrigado. Seu voto entrou no placar e você vai receber o resultado final por e-mail.",
    duplicateMessage:
      "Este e-mail já votou nesta campanha. Cada pessoa tem direito a um voto.",
    consentLabel:
      "Quero receber o resultado da votação e novidades da GueparColor por e-mail.",
    legal:
      "Ao votar você concorda com o regulamento da campanha e com o tratamento dos seus dados conforme a LGPD.",
  },

  results: {
    title: "Placar ao vivo",
    description:
      "O painel abaixo atualiza sozinho a cada voto registrado, sem precisar recarregar a página.",
    emptyState: "Ainda não há votos. Seja o primeiro a abrir o placar.",
  },

  howItWorks: [
    {
      title: "Escolha o conceito",
      body: "Cinco embalagens, cinco personalidades. Toque na que você colocaria na sua bancada.",
    },
    {
      title: "Confirme com seu e-mail",
      body: "O e-mail garante que cada pessoa vote uma vez só e que o placar reflita a escolha real.",
    },
    {
      title: "Acompanhe o resultado",
      body: "O placar é público e atualiza em tempo real. O vencedor vai para produção e chega às lojas.",
    },
  ],

  footer: {
    note: "Campanha promocional sem cunho comercial. Consulte o regulamento completo.",
    links: [
      { label: "Regulamento", href: "/regulamento" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Fale com a gente", href: "mailto:contato@gueparcolor.com.br" },
    ],
  },

  options: [
    {
      id: "grafite-neon",
      badge: "1",
      name: "Grafite Neon",
      pitch: "Ícones fluorescentes sobre preto fosco: polvo, boombox, troféu e caveira.",
      image: "/embalagens/opcao-01-grafite-neon.webp",
      alt: "Lata preta GueparColor com ilustrações neon de polvo, boombox, troféu e caveira",
      accent: "#AE3BF0",
      surface: "asphalt",
    },
    {
      id: "mascote-classico",
      badge: "2",
      name: "Mascote Clássico",
      pitch: "O boneco spray em traço de desenho antigo, com a marca em bloco horizontal.",
      image: "/embalagens/opcao-02-mascote-classico.webp",
      alt: "Lata branca GueparColor com mascote em forma de spray andando, desenhado em preto",
      accent: "#10325A",
      surface: "paper",
    },
    {
      id: "risco-fosco",
      badge: "3",
      name: "Risco Fosco",
      pitch: "Preto sobre preto com marcas de garra e a marca em vermelho na vertical.",
      image: "/embalagens/opcao-03-risco-fosco.webp",
      alt: "Lata preta fosca GueparColor com marcas de garra em diagonal",
      accent: "#4A4A4A",
      surface: "paper",
    },
    {
      id: "minimal-branco",
      badge: "4",
      name: "Minimal Branco",
      pitch: "Só logo, tipografia vertical e respiro. Limpa na gôndola e na oficina.",
      image: "/embalagens/opcao-04-minimal-branco.webp",
      alt: "Lata branca minimalista GueparColor com a marca em azul-marinho e vermelho na vertical",
      accent: "#E4002B",
      surface: "asphalt",
    },
    {
      id: "faca-voce-mesmo",
      badge: "5",
      name: "Toda Ideia Merece Cor",
      pitch: "Tampa na cor da tinta, cadeira reformada e os benefícios na frente da lata.",
      image: "/embalagens/opcao-05-faca-voce-mesmo.webp",
      alt: "Lata preta GueparColor com tampa laranja e ilustração de cadeira sendo repintada",
      accent: "#E8761F",
      surface: "paper",
    },
  ] satisfies VoteOption[],
};

export const optionsById = new Map(campaign.options.map((o) => [o.id, o]));

export const votingDeadline = process.env.NEXT_PUBLIC_VOTING_DEADLINE
  ? new Date(process.env.NEXT_PUBLIC_VOTING_DEADLINE)
  : null;

export const showLiveResults =
  process.env.NEXT_PUBLIC_SHOW_LIVE_RESULTS !== "false";

export type Campaign = typeof campaign;
