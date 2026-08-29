import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { StoryBoard } from "@/components/StoryBoard";
import { TakesViews } from "@/components/TakesViews";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { breadcrumbList, mappedTakes, toStoryCard } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Expert picks",
  "Verified expert CFB and NFL picks: who they’re taking, the quote, and the market price. Newest first.",
  "/stories"
);

export default function StoriesPage() {
  const cards = mappedTakes(loadCalls(), loadEvents(), loadPundits()).map(
    toStoryCard
  );

  return (
    <main id="main" className="shell shell-wide">
      <JsonLd
        data={breadcrumbList([{ name: "Takes", path: "/stories" }])}
      />
      <Breadcrumbs items={[{ name: "Picks", href: "/" }, { name: "Takes" }]} />
      <div className="eyebrow type-broadcast">Takes</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        Who picked
        <br />
        what.
      </h1>
      <p className="lede">
        Verified picks from named analysts and commentators, with the original
        quote and market price. Browse the visual quote feed or switch to the
        compact ledger.
      </p>
      <TakesViews current="feed" />
      <StoryBoard cards={cards} />
    </main>
  );
}
