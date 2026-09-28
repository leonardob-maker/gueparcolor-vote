import { z } from "zod";
import { campaign, votingDeadline } from "@/config/campaign";

/**
 * Domínios de e-mail temporário. A lista é curta de propósito: serve para
 * cortar o abuso mais óbvio sem transformar o formulário num muro.
 * Para campanhas grandes, troque por um serviço de verificação real.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "temp-mail.org",
  "dispostable.com",
]);

const validOptionIds = campaign.options.map((o) => o.id) as [string, ...string[]];

export const voteSchema = z.object({
  optionId: z.enum(validOptionIds, {
    errorMap: () => ({ message: "Escolha uma das cinco embalagens antes de confirmar." }),
  }),
  email: z
    .string({ required_error: "Informe seu e-mail." })
    .trim()
    .toLowerCase()
    .min(6, "Informe seu e-mail.")
    .max(254, "E-mail longo demais.")
    .email("Confira o e-mail: parece que falta algo.")
    .refine((value) => !DISPOSABLE_DOMAINS.has(value.split("@")[1] ?? ""), {
      message: "Use um e-mail permanente para que possamos enviar o resultado.",
    }),
  displayName: z.string().trim().max(80).optional().or(z.literal("")),
  consentMarketing: z.boolean().default(false),
  /** Campo isca invisível: se vier preenchido, é bot. */
  website: z.string().max(0, "Falha na verificação anti-robô.").optional(),
});

export type VoteInput = z.infer<typeof voteSchema>;

export function isVotingOpen(now: Date = new Date()) {
  if (!votingDeadline) return true;
  return now.getTime() < votingDeadline.getTime();
}

/** Mascara o e-mail para exibição em logs e telas de confirmação. */
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  const head = user.slice(0, 2);
  return `${head}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}
