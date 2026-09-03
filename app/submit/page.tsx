import type { Metadata } from "next";
import { Suspense } from "react";
import { TipSubmissionForm } from "@/components/TipSubmissionForm";
import { loadEvents } from "@/lib/data";
import { socialPageMeta } from "@/lib/social-card/metadata";

export const metadata: Metadata = socialPageMeta(
  "submit",
  "Submit a public pick source",
  "Send Pundits.Pro a public source link for a named college football or NFL pick.",
);

export default function SubmitPage() {
  const events = loadEvents().map(({ slug, title, awayTeam, homeTeam }) => ({
    slug,
    title,
    yesLabel: awayTeam ?? "YES",
    noLabel: homeTeam ?? "NO",
  }));
  return (
    <main id="main" className="shell tip-submit-page">
      <div className="eyebrow type-broadcast">Help fill the board</div>
      <h1 className="tip-submit-title">Found a pick we missed?</h1>
      <p className="tip-submit-lede lede">
        Send the original public post, article, podcast, or video. The link is enough; add any context you have. We verify every source before anything reaches the board.
      </p>
      <Suspense fallback={<div className="tip-submit-card" aria-busy="true">Loading form…</div>}>
        <TipSubmissionForm events={events} />
      </Suspense>
    </main>
  );
}
