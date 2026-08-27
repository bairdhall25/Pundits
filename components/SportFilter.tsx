import Link from "next/link";

const ITEMS = [
  { href: "/", id: "all" as const, label: "All" },
  { href: "/ncaaf/", id: "ncaaf" as const, label: "College Football" },
  { href: "/nfl/", id: "nfl" as const, label: "NFL" },
];

export function SportFilter({ current }: { current: "all" | "ncaaf" | "nfl" }) {
  return (
    <div className="feed-tabs sport-filter" role="navigation" aria-label="Sport">
      {ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={current === item.id ? "page" : undefined}
          className={current === item.id ? "on" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
