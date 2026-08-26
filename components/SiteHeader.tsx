import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#2a2a2a] bg-[rgba(10,10,10,0.94)] backdrop-blur">
    <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 pt-2.5 md:flex-row md:items-center md:justify-between md:px-5 md:py-4">
      <Link
        href="/"
        className="type-broadcast text-[28px] leading-none tracking-[0.12em] text-[var(--green)] md:text-[42px]"
      >
        PUNDITS<span className="text-[var(--ink)]">.</span>
      </Link>
      <nav className="flex gap-1 overflow-x-auto text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:[mask-image:linear-gradient(90deg,#000_85%,transparent)] max-md:[-webkit-mask-image:linear-gradient(90deg,#000_85%,transparent)]">
        <Link href="/" className="px-2.5 py-2 hover:text-[var(--green)]">
          Picks
        </Link>
        <Link href="/ncaaf" className="px-2.5 py-2 hover:text-[var(--green)]">
          NCAAF
        </Link>
        <Link href="/nfl" className="px-2.5 py-2 hover:text-[var(--green)]">
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
    </div>
    </header>
  );
}
