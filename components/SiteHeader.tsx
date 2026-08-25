import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 border-b border-[#2a2a2a] px-5 py-4">
      <Link
        href="/"
        className="type-broadcast text-[42px] leading-none tracking-[0.12em] text-[var(--green)]"
      >
        PUNDITS<span className="text-[var(--ink)]">.</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        <Link href="/" className="px-2.5 py-2 hover:text-[var(--green)]">
          Bets
        </Link>
        <Link href="/#ncaaf" className="px-2.5 py-2 hover:text-[var(--green)]">
          NCAAF
        </Link>
        <Link href="/#nfl" className="px-2.5 py-2 hover:text-[var(--green)]">
          NFL
        </Link>
        <Link
          href="/leaderboard"
          className="px-2.5 py-2 hover:text-[var(--green)]"
        >
          Leaderboard
        </Link>
        <Link href="/book" className="px-2.5 py-2 hover:text-[var(--green)]">
          The Book
        </Link>
      </nav>
    </header>
  );
}
