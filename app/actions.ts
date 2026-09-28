"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { isVotingOpen, voteSchema } from "@/lib/validation";
import { campaign } from "@/config/campaign";
import type { Tally, VoteFormState } from "@/types";

const UNIQUE_VIOLATION = "23505";

function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT ?? "gueparcolor";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

async function readRequestContext() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  return {
    ipHash: hashIp(ip),
    userAgent: (h.get("user-agent") ?? "").slice(0, 255),
  };
}

/**
 * Registra um voto.
 *
 * A unicidade por e-mail é garantida em duas camadas:
 *  1. índice único em `votes.email_key` (o banco é a fonte da verdade);
 *  2. leitura prévia, só para devolver uma mensagem amigável sem depender do erro.
 * Corridas simultâneas caem na camada 1 e recebem o mesmo texto.
 */
export async function submitVote(
  _prev: VoteFormState,
  formData: FormData,
): Promise<VoteFormState> {
  if (!isVotingOpen()) {
    return { status: "error", message: "A votação foi encerrada. Obrigado por participar." };
  }

  const parsed = voteSchema.safeParse({
    optionId: formData.get("optionId"),
    email: formData.get("email"),
    displayName: formData.get("displayName") ?? "",
    consentMarketing: formData.get("consentMarketing") === "on",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path[0];
    return {
      status: "error",
      message: issue.message,
      field: field === "email" || field === "optionId" ? field : "form",
    };
  }

  const { optionId, email, displayName, consentMarketing } = parsed.data;
  const supabase = createSupabaseAdminClient();
  const { ipHash, userAgent } = await readRequestContext();

  // Antifraude leve: limita a rajada de votos vinda do mesmo IP.
  const limit = Number(process.env.VOTES_PER_IP_PER_HOUR ?? 8);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentFromIp } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if ((recentFromIp ?? 0) >= limit) {
    return {
      status: "error",
      message: "Muitos votos vindos desta conexão agora há pouco. Tente de novo mais tarde.",
      field: "form",
    };
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id")
    .eq("email_key", email)
    .maybeSingle();

  if (existing) {
    return { status: "error", message: campaign.vote.duplicateMessage, field: "email" };
  }

const { error } = await (supabase.from("votes") as any).insert({
    option_id: optionId,
    email,
    display_name: displayName || null,
    consent_marketing: consentMarketing,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { status: "error", message: campaign.vote.duplicateMessage, field: "email" };
    }
    console.error("[submitVote]", error);
    return {
      status: "error",
      message: "Não foi possível registrar o voto agora. Tente novamente em instantes.",
      field: "form",
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    optionId,
    message: campaign.vote.successBody,
  };
}

/** Fallback de leitura do placar: usado no primeiro render e quando o Realtime cai. */
export async function fetchTallies(): Promise<Tally[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vote_tallies")
    .select("option_id, total, updated_at");

  if (error) {
    console.error("[fetchTallies]", error);
    return [];
  }
  return data ?? [];
}
