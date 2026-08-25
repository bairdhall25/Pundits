export type CallKind = "hard" | "soft";

export type CallStatus = "pending" | "hit" | "miss";

export type Pundit = {
  id: string;
  name: string;
  outlet: string;
  photo: string;
  estimated2025: { wins: number; losses: number };
};

export type Side = "yes" | "no";

export type Event = {
  slug: string;
  title: string;
  contractName: string;
  yesCents: number | null;
  noCents: number | null;
  onHome: boolean;
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

export type PunditRecord = Pundit & {
  accuracy2025: number;
  season2026: { wins: number; losses: number; pending: number };
};
