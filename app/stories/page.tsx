import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { StoryFeed } from "@/components/StoryFeed";
import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { breadcrumbList, mappedTakes } from "@/lib/seo";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Pick stories",
  "Who picked what. Faces, quotes, and the Kalshi freeze. Newest first.",
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
        Newest mapped takes, as a feed. Face, quote, freeze. Hypothetical $100.
      </p>
      <StoryFeed takes={takes} />
    </main>
  );
}
