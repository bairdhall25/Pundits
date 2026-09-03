import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import type { ActivityRecord } from "@/lib/types";

const board: ActivityRecord[] = [
  {
    id: "patterson",
    name: "Chip Patterson",
    outlet: "CBS / Cover 3",
    photo: "/photos/patterson.jpg",
    sport: "ncaaf",
    season2026: { wins: 1, losses: 1, pending: 2 },
    mappedPending: 2,
    totalCalls: 4,
  },
  {
    id: "mcelroy",
    name: "Greg McElroy",
    outlet: "ESPN / Always College Football",
    photo: "/photos/mcelroy.jpg",
    sport: "ncaaf",
    season2026: { wins: 1, losses: 0, pending: 0 },
    mappedPending: 0,
    totalCalls: 1,
  },
  {
    id: "finebaum",
    name: "Paul Finebaum",
    outlet: "Finebaum / ESPN",
    photo: "/photos/finebaum.jpg",
    sport: "ncaaf",
    season2026: { wins: 0, losses: 1, pending: 3 },
    mappedPending: 3,
    totalCalls: 4,
  },
];

const meta = {
  title: "Pilot/Leaderboard tabs",
  component: LeaderboardClient,
  args: { board },
} satisfies Meta<typeof LeaderboardClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResultsAndOpen: Story = {};
