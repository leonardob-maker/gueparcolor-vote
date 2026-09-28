import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { VoteSection } from "@/components/sections/VoteSection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { fetchTallies } from "@/app/actions";

// O placar precisa ser fresco a cada carregamento.
export const dynamic = "force-dynamic";

export default async function Page() {
  const tallies = await fetchTallies();

  return (
    <main>
      <Hero />
      <VoteSection initialTallies={tallies} />
      <HowItWorks />
      <SiteFooter />
    </main>
  );
}
