import { AllPicksSlate } from "@/components/AllPicksSlate";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SportFilter } from "@/components/SportFilter";
import { breadcrumbList, collectionPageJsonLd } from "@/lib/seo";
import { pageMeta } from "@/lib/site";
import { socialPageImage } from "@/lib/social-card/metadata";

const title = "All expert picks";
const description =
  "Browse every current college football and NFL game with a verified expert pick, plus open futures.";

export const metadata = pageMeta(
  title,
  description,
  "/picks/",
  socialPageImage("home", title)
);

export default function PicksPage() {
  return (
    <main id="main" className="shell">
      <JsonLd data={collectionPageJsonLd(title, "/picks/", description)} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Picks", path: "/picks" },
        ])}
      />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Picks" }]} />
      <div className="eyebrow type-broadcast">Expert picks</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        All picks.
      </h1>
      <p className="lede">
        Every current college football and NFL game with a verified pick, plus
        open futures. Choose a league to narrow the board.
      </p>
      <SportFilter current="all" />
      <AllPicksSlate />
    </main>
  );
}
