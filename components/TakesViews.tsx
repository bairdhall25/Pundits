import Link from "next/link";

export function TakesViews({ current }: { current: "feed" | "book" }) {
  return (
    <div className="feed-tabs sport-filter" role="navigation" aria-label="Takes views">
      <Link
        href="/stories/"
        aria-current={current === "feed" ? "page" : undefined}
        className={current === "feed" ? "on" : undefined}
      >
        Quote feed
      </Link>
      <Link
        href="/book/"
        aria-current={current === "book" ? "page" : undefined}
        className={current === "book" ? "on" : undefined}
      >
        Compact ledger
      </Link>
    </div>
  );
}
