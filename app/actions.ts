"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { isVotingOpen, voteSchema } from "@/lib/validation";
import { campaign } from "@/config/campaign";
import type { Tally, VoteFormState } from "@/types";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT ?? "gueparcolor";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

async function readRequestContext() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  return { ipHash: hashIp(ip) };
}

export async function submitVote(
  _prev: VoteFormState,
  formData: FormData,
): Promise<VoteFormState> {
  if (!isVotingOpen()) {
    return { status: "error", message: "Votação encerrada." };
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
    return { status: "error", message: issue.message, field: "form" as any };
  }

  const { optionId, email, displayName } = parsed.data;
  const { ipHash } = await readRequestContext();

  if (!SCRIPT_URL) {
    return { status: "error", message: "Script não configurado", field: "form" };
  }

  try {
    const timestamp = new Date().toISOString();
    const params = new URLSearchParams({
      timestamp,
      email,
      nome: displayName || "",
      opcao: optionId,
      ip: ipHash,
    });

    const res = await fetch(`${SCRIPT_URL}?${params}`, { method: "POST" });
    const data = (await res.json()) as { success?: boolean };

    if (!data.success) {
      return { status: "error", message: "Erro ao registrar", field: "form" };
    }
  } catch (err) {
    console.error(err);
    return { status: "error", message: "Erro ao registrar voto", field: "form" };
  }

  return { status: "success", optionId, message: campaign.vote.successBody };
}

export async function fetchTallies(): Promise<Tally[]> {
  const counts = new Map<string, number>();
  for (const option of campaign.options) {
    counts.set(option.id, 0);
  }
  return Array.from(counts.entries()).map(([option_id, total]) => ({
    option_id,
    total,
    updated_at: new Date().toISOString(),
  }));
}