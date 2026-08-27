import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { breadcrumbList, mappedTakes, pickStory, takePath } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Pick stories",
  "Who picked what. One story per mapped expert take, written from the ledger.",
  "/stories"
);

export default function StoriesPage() {
  const calls = loadCalls();
  const events = loadEvents();
  const pundits = loadPundits();
  const takes = mappedTakes(calls, events, pundits);

  return (
    <main id="main" className="shell">
      <JsonLd
        data={breadcrumbList([
          { name: "Stories", path: "/stories" },
        ])}
      />
      <Breadcrumbs items={[{ name: "Picks", href: "/" }, { name: "Stories" }]} />
      <div className="eyebrow type-broadcast">Pick stories</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Who picked
        <br />
        what.
      </h1>
      <p className="lede">
        Scout verifies the quote. Promote maps it. This page is the index —
        one URL per mapped expert take, templated from the ledger. Hypothetical
        $100 at the freeze.
      </p>
      <ul className="take-list">
        {takes.map((take) => {
          const story = pickStory(take, calls, pundits);
          return (
            <li key={`${take.event.slug}-${take.pundit.id}`}>
              <Link href={takePath(take.event.slug, take.pundit.id)}>
                {story.headline}
                <span>
                  {take.call.source}
                  {take.call.sourceDate ? ` · ${take.call.sourceDate}` : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
