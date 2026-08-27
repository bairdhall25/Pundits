export type CallKind = "hard" | "soft";

export type CallStatus = "pending" | "hit" | "miss";

export type PunditSport = "ncaaf" | "nfl" | "both";

export type Pundit = {
  id: string;
  name: string;
  outlet: string;
  photo: string;
  sport: PunditSport;
};

export type Side = "yes" | "no";

export type Sport = "ncaaf" | "nfl";

export type EventKind = "game" | "future";

export type Team = {
  id: string;
  name: string;
  abbr: string;
  primary: string;
  ink: string;
  sport: Sport;
};

export type Event = {
  slug: string;
  title: string;
  contractName: string;
  yesCents: number | null;
  noCents: number | null;
  sourceUrl: string | null;
  sourcedAt: string | null;
  onHome: boolean;
  sport: Sport;
  homeRank: number;
  kind?: EventKind;
  awayTeam?: string;
  homeTeam?: string;
  awayTeamId?: string;
  homeTeamId?: string;
  teamId?: string;
  kickoff?: string;
  kickoffDate?: string;
  network?: string;
  /** Year the regular season starts — not kickoff calendar year, not Kalshi's champion year. 2026 NFL Super Bowl is Feb 2027; season is still 2026. */
  season?: number;
};

export type EventsFile = {
  freezeDate: string;
  venue: "kalshi";
  source: string;
  events: Event[];
};

export type Call = {
  id: string;
  punditId: string;
  claim: string;
  source: string;
  sourceUrl: string | null;
  sourceDate: string;
  kind: CallKind;
  subject: string;
  paysOn: string;
  status: CallStatus;
  eventSlug?: string;
  side?: Side;
};

export type ActivityRecord = Pundit & {
  season2026: { wins: number; losses: number; pending: number };
  mappedPending: number;
  totalCalls: number;
};

export type CardSide = {
  side: Side;
  label: string;
  cents: number | null;
  calls: Call[];
  teamId?: string;
};
