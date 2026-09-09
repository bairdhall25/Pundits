export type CallKind = "hard" | "soft";

export type CallStatus = "pending" | "hit" | "miss";

/** How the stored claim should be presented. Absent means infer from evidence. */
export type EvidenceKind = "spoken-quote" | "reported-selection";

/**
 * Verified locator for the stored evidence. Every field is optional.
 * Absent means unknown — do not guess a timestamp or transcript.
 */
export type SourceLocator = {
  timestamp?: string;
  section?: string;
  transcriptUrl?: string;
};

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
  /** Kalshi event ticker, e.g. KXNCAAFGAME-26AUG29UNCTCU. */
  ticker?: string;
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
  /** Schedule week for games (CFB Week 0 = 0). Futures have no week. */
  week?: number;
  /** Final score, sourced from the official box score linked in the grade run doc. */
  awayScore?: number;
  homeScore?: number;
  /** Authoritative result URL (official box score) that grounds the score fields. */
  resultUrl?: string;
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
  /** Optional source-grounded paraphrase (at most 60 words) of why this speaker made the pick. */
  reasoning?: string;
  source: string;
  sourceUrl: string | null;
  sourceDate: string;
  kind: CallKind;
  subject: string;
  paysOn: string;
  status: CallStatus;
  /** ISO day the call was graded after leaving pending status. */
  gradedAt?: string;
  eventSlug?: string;
  side?: Side;
  /**
   * How to present `claim`. Spoken quotes stay quoted speech.
   * Reported selections are labeled selections, not invented dialogue.
   * Absent: infer (GameDay Cole URLs are reported-selection until Promote sets this).
   */
  evidenceKind?: EvidenceKind;
  /** Verified locator only. Omit rather than guess. */
  sourceLocator?: SourceLocator;
  /**
   * First live Pundits publication of this receipt.
   * ISO date (`YYYY-MM-DD`) or datetime. Immutable once set.
   * Absent means unknown — never fall back to sourceDate, build time, or noon.
   * Promote sets this on new live publication; do not backfill historical rows.
   */
  firstPublishedAt?: string;
  /**
   * Last material editorial update distinct from sourceDate and gradedAt.
   * ISO date or datetime. A grade may set or bump this without changing firstPublishedAt.
   */
  updatedAt?: string;
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
