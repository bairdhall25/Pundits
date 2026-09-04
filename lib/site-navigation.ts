import { CONTACT_HREF } from "@/lib/site";

export type SiteSection = "home" | "picks" | "takes" | "pundits";

export type SiteDestination = {
  href: string;
  label: string;
  external?: boolean;
};

export type PrimaryDestination = SiteDestination & {
  ariaLabel: string;
  section: SiteSection;
};

export type SiteNavigationGroup = {
  id: string;
  label: string;
  items: readonly SiteDestination[];
};

export const PRIMARY_NAV: readonly PrimaryDestination[] = [
  {
    href: "/",
    label: "Home",
    ariaLabel: "Home",
    section: "home",
  },
  {
    href: "/picks/",
    label: "Picks",
    ariaLabel: "Picks — browse by game",
    section: "picks",
  },
  {
    href: "/stories/",
    label: "Takes",
    ariaLabel: "Takes — quote feed",
    section: "takes",
  },
  {
    href: "/leaderboard/",
    label: "Pundits",
    ariaLabel: "Pundits — profiles and records",
    section: "pundits",
  },
];

export const PICKS_NAV: readonly SiteDestination[] = [
  { href: "/picks/", label: "All picks" },
  { href: "/ncaaf/", label: "NCAAF" },
  { href: "/nfl/", label: "NFL" },
];

export const MORE_NAV_GROUPS: readonly SiteNavigationGroup[] = [
  {
    id: "browse",
    label: "Browse",
    items: [
      { href: "/ncaaf/", label: "College Football" },
      { href: "/nfl/", label: "NFL" },
    ],
  },
  {
    id: "takes-views",
    label: "Takes views",
    items: [
      { href: "/stories/", label: "Quote feed" },
      { href: "/book/", label: "Compact ledger" },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      { href: "/submit/", label: "Submit a source" },
      { href: "/about/", label: "About Pundits" },
      { href: "/methodology/", label: "Methodology" },
      { href: CONTACT_HREF, label: "Contact", external: true },
    ],
  },
];

export const FOOTER_NAV_GROUPS: readonly SiteNavigationGroup[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { href: "/", label: "Home" },
      { href: "/picks/", label: "Picks" },
      { href: "/ncaaf/", label: "College Football" },
      { href: "/nfl/", label: "NFL" },
    ],
  },
  {
    id: "follow",
    label: "Follow the record",
    items: [
      { href: "/stories/", label: "Takes" },
      { href: "/book/", label: "Compact ledger" },
      { href: "/leaderboard/", label: "Pundits" },
    ],
  },
  {
    id: "company",
    label: "About",
    items: [
      { href: "/submit/", label: "Submit a source" },
      { href: "/about/", label: "About Pundits" },
      { href: "/methodology/", label: "Methodology" },
      { href: CONTACT_HREF, label: "Contact", external: true },
    ],
  },
  {
    id: "legal",
    label: "Legal",
    items: [
      { href: "/privacy/", label: "Privacy" },
      { href: "/terms/", label: "Terms" },
    ],
  },
];

export function normalizeNavigationPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export function isExactNavigationPath(pathname: string, href: string): boolean {
  if (!href.startsWith("/")) return false;
  return normalizeNavigationPath(pathname) === normalizeNavigationPath(href);
}

export function activeSiteSection(pathname: string): SiteSection | undefined {
  const path = normalizeNavigationPath(pathname);

  if (path === "/") return "home";

  if (
    path === "/picks" ||
    path === "/ncaaf" ||
    path.startsWith("/ncaaf/") ||
    path === "/nfl" ||
    path.startsWith("/nfl/") ||
    path.startsWith("/teams/") ||
    /^\/picks\/[^/]+$/.test(path)
  ) {
    return "picks";
  }

  if (
    path === "/stories" ||
    path.startsWith("/stories/") ||
    path === "/book" ||
    path.startsWith("/book/") ||
    /^\/picks\/[^/]+\/[^/]+$/.test(path)
  ) {
    return "takes";
  }

  if (
    path === "/leaderboard" ||
    path.startsWith("/leaderboard/") ||
    path === "/pundits" ||
    path.startsWith("/pundits/")
  ) {
    return "pundits";
  }

  return undefined;
}
