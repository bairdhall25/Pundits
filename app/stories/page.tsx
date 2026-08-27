import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { StoryBoard } from "@/components/StoryBoard";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { breadcrumbList, mappedTakes, toStoryCard } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Pick stories",
  "Who picked what. Verified first-person takes with the Kalshi freeze. Newest first.",
  "/stories"
);

export default function StoriesPage() {
  const cards = mappedTakes(loadCalls(), loadEvents(), loadPundits()).map(
    toStoryCard
  );

  return (
    <main id="main" className="shell shell-wide">
      <JsonLd
        data={breadcrumbList([{ name: "Stories", path: "/stories" }])}
      />
      <Breadcrumbs items={[{ name: "Picks", href: "/" }, { name: "Stories" }]} />
      <div className="eyebrow type-broadcast">Pick stories</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Who picked
        <br />
        what.
      </h1>
      <p className="lede">
        Verified expert picks, with the quote and the Kalshi number. Filter by
        league or search a name. Hypothetical $100.
      </p>
      <StoryBoard cards={cards} />
    </main>
  );
}
