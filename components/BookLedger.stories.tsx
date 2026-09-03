import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookLedger } from "@/components/BookLedger";
import type { Call, Event, Pundit } from "@/lib/types";

const pundits: Pundit[] = [
  {
    id: "patterson",
    name: "Chip Patterson",
    outlet: "CBS / Cover 3",
    photo: "/photos/patterson.jpg",
    sport: "ncaaf",
  },
  {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "Finebaum / ESPN",
    photo: "/photos/finebaum.jpg",
    sport: "ncaaf",
  },
];

const events: Event[] = [
  {
    slug: "clemson-at-lsu-2026",
    title: "Clemson at LSU",
    contractName: "Clemson vs LSU — moneyline",
    yesCents: 24,
    noCents: 78,
    sourceUrl: "https://kalshi.com/",
    sourcedAt: "2026-08-26",
    onHome: true,
    sport: "ncaaf",
    homeRank: 1,
    kind: "game",
    awayTeam: "Clemson",
    homeTeam: "LSU",
    season: 2026,
  },
];

const calls: Call[] = [
  {
    id: "patterson-clemson",
    punditId: "patterson",
    claim: "Clemson has the more complete roster entering the opener.",
    source: "Cover 3",
    sourceUrl: "https://example.com/patterson",
    sourceDate: "2026-09-02",
    kind: "hard",
    subject: "Clemson at LSU",
    paysOn: "Clemson wins",
    status: "pending",
    eventSlug: "clemson-at-lsu-2026",
    side: "yes",
  },
  {
    id: "finebaum-sec",
    punditId: "finebaum",
    claim: "The SEC race will be much more open than people expect.",
    source: "The Paul Finebaum Show",
    sourceUrl: "https://example.com/finebaum",
    sourceDate: "2026-09-01",
    kind: "soft",
    subject: "SEC outlook",
    paysOn: "Editorial take",
    status: "pending",
  },
];

const meta = {
  title: "Pilot/Book filters",
  component: BookLedger,
  args: {
    calls,
    events,
    pundits,
  },
} satisfies Meta<typeof BookLedger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsiveFilters: Story = {};
