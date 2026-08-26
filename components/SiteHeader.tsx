import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

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
        <NavLinks />
      </div>
    </header>
  );
}
