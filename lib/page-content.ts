import { weekArchivePath } from "./archive";
import {
  eventScanStatus,
  finalScoreLine,
  isMapped,
  otherTakes,
  sidesForCard,
} from "./data";
import { quotedEvidenceText } from "./evidence";
import { formatGameWhen, formatShortDate, seasonLabel } from "./format";
import { andList, eventShare, namesOn } from "./share";
import { takePath } from "./site";
import type { ActivityRecord, Call, CallStatus, Event, Pundit, Side } from "./types";

export const TRACKED_SUBSET_DISCLAIMER =
  "This is the tracked subset on Pundits.Pro, not a survey of all experts.";

export const TRACKED_RECORD_DISCLAIMER =
  "This is the Pundits.Pro tracked sample, not a complete career record and not a measure of predictive skill.";

export type ContextLink = { href: string; label: string };

export type GamePickEntry = {
  punditId: string;
  name: string;
  outlet: string;
  side: Side;
  sideLabel: string;
  source: string;
  sourceDate: string | null;
  sourceUrl: string | null;
  claim: string;
  displayText: string;
  href: string;
  status: CallStatus;
};

export type GameSideSummary = {
  side: Side;
  label: string;
  names: string[];
  empty: boolean;
  entries: GamePickEntry[];
};

export type GameComparison = {
  title: string;
  h1: string;
  lede: string;
  description: string;
  coverageLine: string;
  trackedCount: number;
  disclaimer: string;
  disagreement: string | null;
  emptyLine: string | null;
  resultLine: string | null;
  when: string | null;
  isGame: boolean;
  sides: GameSideSummary[];
  entries: GamePickEntry[];
  contextLinks: ContextLink[];
};

function latestCallByPundit(calls: Call[]): Call[] {
  const latest = new Map<string, Call>();
  for (const call of calls) {
    if (!isMapped(call) || !call.punditId) continue;
    const prev = latest.get(call.punditId);
    if (!prev || call.sourceDate >= prev.sourceDate) latest.set(call.punditId, call);
  }
  return [...latest.values()];
}

function verbFor(count: number, past: boolean): string {
  if (past) return count === 1 ? "picked" : "picked";
  return count === 1 ? "picks" : "pick";
}

export function whoPickedLine(
  event: Event,
  calls: Call[],
  pundits: Pundit[],
  past = false
): string {
  const [yes, no] = sidesForCard(event, calls);
  const yesNames = namesOn(yes.calls, pundits);
  const noNames = namesOn(no.calls, pundits);
  const n = yesNames.length + noNames.length;
  if (n === 0) {
    return `No verified pick on ${event.title} yet.`;
  }
  if (!event.awayTeam || !event.homeTeam) {
    const bits = [
      yesNames.length
        ? `${andList(yesNames)} ${yesNames.length === 1 ? (past ? "took" : "takes") : past ? "took" : "take"} ${event.title}`
        : null,
      noNames.length
        ? `${andList(noNames)} ${noNames.length === 1 ? (past ? "was" : "is") : past ? "were" : "are"} against`
        : null,
    ].filter(Boolean);
    return bits.length ? `${bits.join(". ")}.` : `No verified pick on ${event.title} yet.`;
  }
  const bits = [
    yesNames.length
      ? `${andList(yesNames)} ${verbFor(yesNames.length, past)} ${event.awayTeam}`
      : `Nobody on ${event.awayTeam} yet`,
    noNames.length
      ? `${andList(noNames)} ${verbFor(noNames.length, past)} ${event.homeTeam}`
      : `Nobody on ${event.homeTeam} yet`,
  ];
  return `${bits.join(". ")}.`;
}

export function namedDisagreement(
  event: Event,
  calls: Call[],
  pundits: Pundit[],
  past = false
): string | null {
  const [yes, no] = sidesForCard(event, calls);
  const yesNames = namesOn(yes.calls, pundits);
  const noNames = namesOn(no.calls, pundits);
  if (!yesNames.length || !noNames.length) return null;
  if (!event.awayTeam || !event.homeTeam) {
    return `${andList(yesNames)} ${verbFor(yesNames.length, past)} this side. ${andList(noNames)} ${past ? "were" : "are"} against.`;
  }
  return `${andList(yesNames)} ${verbFor(yesNames.length, past)} ${event.awayTeam}. ${andList(noNames)} ${verbFor(noNames.length, past)} ${event.homeTeam}.`;
}

function gameEntries(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): GamePickEntry[] {
  const punditById = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const [yes, no] = sidesForCard(event, calls);
  const labelFor = (side: Side) => (side === "yes" ? yes.label : no.label);
  return latestCallByPundit(calls.filter((c) => c.eventSlug === event.slug))
    .flatMap((call): GamePickEntry[] => {
      const pundit = punditById[call.punditId];
      if (!pundit || !call.side) return [];
      return [
        {
          punditId: pundit.id,
          name: pundit.name,
          outlet: pundit.outlet,
          side: call.side,
          sideLabel: labelFor(call.side),
          source: call.source,
          sourceDate: formatShortDate(call.sourceDate),
          sourceUrl: call.sourceUrl,
          claim: call.claim,
          displayText: quotedEvidenceText(call),
          href: takePath(event.slug, pundit.id),
          status: call.status,
        },
      ];
    })
    .sort(
      (a, b) =>
        a.sideLabel.localeCompare(b.sideLabel) || a.name.localeCompare(b.name)
    );
}

export function gameContextLinks(event: Event): ContextLink[] {
  const links: ContextLink[] = [];
  if (event.awayTeam && event.awayTeamId) {
    links.push({ href: `/teams/${event.awayTeamId}`, label: event.awayTeam });
  }
  if (event.homeTeam && event.homeTeamId) {
    links.push({ href: `/teams/${event.homeTeamId}`, label: event.homeTeam });
  }
  if (event.teamId && !event.awayTeam) {
    links.push({ href: `/teams/${event.teamId}`, label: event.title });
  }
  if (event.season != null && event.week != null) {
    links.push({
      href: weekArchivePath(event.sport, event.season, event.week),
      label: `Week ${event.week} archive`,
    });
  }
  return links;
}

export function gameComparison(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): GameComparison {
  const share = eventShare(event, calls, pundits);
  const [yes, no] = sidesForCard(event, calls);
  const status = eventScanStatus(event, calls);
  const past = status === "final" || status === "grading";
  const entries = gameEntries(event, calls, pundits);
  const yesEntries = entries.filter((e) => e.side === "yes");
  const noEntries = entries.filter((e) => e.side === "no");
  const trackedCount = entries.length;
  const isGame = Boolean(event.awayTeam && event.homeTeam);
  const coverageLine =
    trackedCount === 0
      ? `No verified pick on ${event.title} yet.`
      : `${trackedCount} tracked ${trackedCount === 1 ? "pick" : "picks"} on Pundits.Pro.`;
  const score = finalScoreLine(event, calls);
  const resultLine =
    status === "open"
      ? null
      : score
        ? `Final: ${score}.`
        : share.description.startsWith("Final:")
          ? share.description.split(". ")[0] + "."
          : null;
  const emptySides = [yes, no].filter((side) => side.calls.length === 0);
  const emptyLine =
    emptySides.length === 0
      ? null
      : emptySides
          .map((side) => `No verified pick on ${side.label} in this tracked set.`)
          .join(" ");
  const lede = whoPickedLine(event, calls, pundits, past);
  const description = [resultLine, lede, coverageLine, TRACKED_SUBSET_DISCLAIMER]
    .filter(Boolean)
    .join(" ");

  return {
    title: share.title,
    h1: event.title,
    lede,
    description,
    coverageLine,
    trackedCount,
    disclaimer: TRACKED_SUBSET_DISCLAIMER,
    disagreement: namedDisagreement(event, calls, pundits, past),
    emptyLine,
    resultLine,
    when: formatGameWhen(event) ?? seasonLabel(event.season),
    isGame,
    sides: [
      {
        side: "yes",
        label: yes.label,
        names: namesOn(yes.calls, pundits),
        empty: yes.calls.length === 0,
        entries: yesEntries,
      },
      {
        side: "no",
        label: no.label,
        names: namesOn(no.calls, pundits),
        empty: no.calls.length === 0,
        entries: noEntries,
      },
    ],
    entries,
    contextLinks: gameContextLinks(event),
  };
}

export function receiptDisagreement(
  event: Event,
  call: Call,
  pundit: Pundit,
  allCalls: Call[],
  pundits: Pundit[]
): string | null {
  if (!call.side) return null;
  const others = latestCallByPundit(
    allCalls.filter(
      (c) => isMapped(c) && c.eventSlug === event.slug && c.punditId !== pundit.id
    )
  );
  if (!others.length) return null;
  const punditById = Object.fromEntries(pundits.map((p) => [p.id, p]));
  const same: string[] = [];
  const opposite: string[] = [];
  for (const other of others) {
    const name = punditById[other.punditId]?.name;
    if (!name || !other.side) continue;
    if (other.side === call.side) same.push(name);
    else opposite.push(name);
  }
  if (!same.length && !opposite.length) return null;
  const past = call.status === "hit" || call.status === "miss";
  const picked =
    event.awayTeam && event.homeTeam
      ? call.side === "yes"
        ? event.awayTeam
        : event.homeTeam
      : null;
  const otherTeam =
    event.awayTeam && event.homeTeam
      ? call.side === "yes"
        ? event.homeTeam
        : event.awayTeam
      : null;
  const bits: string[] = [];
  if (same.length && picked) {
    bits.push(
      `${andList(same)} also ${verbFor(same.length, past)} ${picked}.`
    );
  } else if (same.length) {
    bits.push(`${andList(same)} also weighed in on the same side.`);
  }
  if (opposite.length && otherTeam) {
    bits.push(
      `${andList(opposite)} ${verbFor(opposite.length, past)} ${otherTeam}.`
    );
  } else if (opposite.length) {
    bits.push(`${andList(opposite)} took the other side.`);
  } else if (otherTeam) {
    bits.push(`Nobody else in this tracked set picked ${otherTeam}.`);
  }
  bits.push("The full split is on the game page.");
  return bits.join(" ");
}

export function receiptContextLinks(event: Event, pundit: Pundit): ContextLink[] {
  const links: ContextLink[] = [
    { href: `/picks/${event.slug}`, label: "Game comparison" },
    { href: `/pundits/${pundit.id}`, label: `${pundit.name} profile` },
  ];
  return [...links, ...gameContextLinks(event)];
}

export type ProfileContent = {
  title: string;
  h1: string;
  lede: string;
  description: string;
  outlet: string;
  recordLine: string;
  recordDisclaimer: string;
  gradedSample: number;
  current: Call[];
  historical: Call[];
  unmapped: Call[];
};

export function profileContent(
  pundit: ActivityRecord,
  calls: Call[]
): ProfileContent {
  const mine = calls
    .filter((c) => c.punditId === pundit.id)
    .sort((a, b) => {
      if (a.sourceDate < b.sourceDate) return 1;
      if (a.sourceDate > b.sourceDate) return -1;
      return 0;
    });
  const mapped = mine.filter(isMapped);
  const current = mapped.filter((c) => c.status === "pending");
  const historical = mapped.filter((c) => c.status === "hit" || c.status === "miss");
  const unmapped = otherTakes(pundit.id, calls);
  const gradedSample = pundit.season2026.wins + pundit.season2026.losses;
  const recordLine =
    gradedSample > 0
      ? `2026 tracked record: ${pundit.season2026.wins}–${pundit.season2026.losses} on ${gradedSample} graded pick${gradedSample === 1 ? "" : "s"}${
          pundit.mappedPending
            ? `, with ${pundit.mappedPending} open`
            : ""
        }.`
      : pundit.mappedPending
        ? `No graded picks in the 2026 tracked sample yet — ${pundit.mappedPending} open.`
        : "No graded picks in the 2026 tracked sample yet.";
  const currentBit =
    current.length === 0
      ? "No current mapped picks."
      : `${current.length} current mapped pick${current.length === 1 ? "" : "s"}.`;
  const lede = `${pundit.name} is on ${pundit.outlet}. ${currentBit} ${recordLine}`.trim();
  return {
    title: `${pundit.name}: current picks and tracked record`,
    h1: pundit.name,
    lede,
    description: `${lede} ${TRACKED_RECORD_DISCLAIMER}`,
    outlet: pundit.outlet,
    recordLine,
    recordDisclaimer: TRACKED_RECORD_DISCLAIMER,
    gradedSample,
    current,
    historical,
    unmapped,
  };
}
