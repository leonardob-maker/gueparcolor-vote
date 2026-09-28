import { campaign } from "@/config/campaign";

export function SiteFooter() {
  return (
    <footer className="bg-paper-dim py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-3xl leading-none">
            GUEPAR<span className="text-cap">COLOR</span>
          </p>
          <p className="mt-2 max-w-[42ch] text-sm text-asphalt/60">{campaign.footer.note}</p>
        </div>

        <nav aria-label="Links da campanha" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          {campaign.footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-asphalt"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
