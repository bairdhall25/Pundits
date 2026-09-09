import {
  gamesForWeek,
  teamEvents,
  teamHasTakes,
  weekArchivePath,
  weekRecord,
} from "./archive";
import {
  eventKind,
  eventScanStatus,
  finalScoreLine,
  finalScoreParts,
  getTeam,
  isMapped,
  otherTakes,
  sidesForCard,
} from "./data";
import { quotedEvidenceText } from "./evidence";
import { getLeagueSlate, getWeekArchiveGames } from "./featured";
import { formatGameWhen, formatShortDate, seasonLabel, sportChip } from "./format";
import { andList, eventShare, namesOn } from "./share";
import { takePath } from "./site";
import type {
  ActivityRecord,
  Call,
  CallStatus,
  Event,
  Pundit,
  Side,
  Sport,
  Team,
} from "./types";

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
  coverageLine: string | null;
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
    links.push({
      href: `/teams/${event.teamId}`,
      label: getTeam(event.teamId)?.name ?? "Team page",
    });
  }
  if (event.season != null && event.week != null) {
    links.push({
      href: weekArchivePath(event.sport, event.season, event.week),
      label: `Week ${event.week} archive`,
    });
  }
  return links;
}

function futureSubject(event: Event): string {
  return getTeam(event.teamId)?.name ?? event.title;
}

function emptySideNote(
  event: Event,
  sides: Array<{ side: Side; label: string; calls: Call[] }>,
  isGame: boolean,
  trackedCount: number
): string | null {
  if (trackedCount === 0) return null;
  const emptySides = sides.filter((side) => side.calls.length === 0);
  if (!emptySides.length) return null;
  if (isGame) {
    return emptySides
      .map((side) => `No verified pick on ${side.label} in this tracked set.`)
      .join(" ");
  }
  const subject = futureSubject(event);
  return emptySides
    .map((side) =>
      side.side === "yes"
        ? `No verified pick taking ${subject} in this tracked set.`
        : `No verified pick against ${subject} in this tracked set.`
    )
    .join(" ");
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
      ? null
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
  const emptyLine = emptySideNote(event, [yes, no], isGame, trackedCount);
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
  const eventLabel =
    event.awayTeam && event.homeTeam ? "Game comparison" : "Market page";
  const links: ContextLink[] = [
    { href: `/picks/${event.slug}`, label: eventLabel },
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

function kickoffValue(event: Event): number {
  if (!event.kickoffDate) return Number.POSITIVE_INFINITY;
  return Date.parse(`${event.kickoffDate}T00:00:00Z`);
}

function opponentName(teamId: string, event: Event): string | null {
  if (event.awayTeamId === teamId) return event.homeTeam ?? null;
  if (event.homeTeamId === teamId) return event.awayTeam ?? null;
  return null;
}

function teamSideFor(teamId: string, event: Event): Side | null {
  if (event.awayTeamId === teamId) return "yes";
  if (event.homeTeamId === teamId) return "no";
  if (event.teamId === teamId) return "yes";
  return null;
}

function beatLine(event: Event, calls: Call[]): string | null {
  const parts = finalScoreParts(event, calls);
  return parts ? `${parts.winner} beat ${parts.loser}` : null;
}

export type TeamMatchup = {
  event: Event;
  href: string;
  when: string | null;
  resultLine: string | null;
  beatLine: string | null;
  forTeam: GamePickEntry[];
  againstTeam: GamePickEntry[];
  noCapturedPick: boolean;
  noCapturedPickOnGame: boolean;
  emptyFor: string;
  emptyAgainst: string;
  lede: string;
};

export type TeamContent = {
  title: string;
  h1: string;
  lede: string;
  description: string;
  disclaimer: string;
  noScheduledGame: boolean;
  noCapturedPick: boolean;
  nextMatchup: TeamMatchup | null;
  upcoming: TeamMatchup[];
  historical: TeamMatchup[];
  otherMarkets: Event[];
  contextLinks: ContextLink[];
};

function teamMatchup(
  team: Team,
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): TeamMatchup {
  const comparison = gameComparison(event, calls, pundits);
  const side = teamSideFor(team.id, event);
  const forTeam = side
    ? comparison.entries.filter((entry) => entry.side === side)
    : [];
  const againstTeam = side
    ? comparison.entries.filter((entry) => entry.side !== side)
    : comparison.entries;
  const opponent = opponentName(team.id, event);
  const past =
    eventScanStatus(event, calls) === "final" ||
    eventScanStatus(event, calls) === "grading";
  const noCapturedPickOnGame = comparison.trackedCount === 0;
  const noCapturedPick = forTeam.length === 0;
  let lede: string;
  const pendingBit = past ? "" : " yet";
  if (noCapturedPickOnGame) {
    lede = `No captured pick on ${event.title}${pendingBit}.`;
  } else if (noCapturedPick) {
    const againstLine = againstTeam.length && opponent
      ? `${andList(againstTeam.map((entry) => entry.name))} ${verbFor(
          againstTeam.length,
          past
        )} ${opponent}.`
      : null;
    lede = [`No captured pick on ${team.name}${pendingBit}.`, againstLine]
      .filter(Boolean)
      .join(" ");
  } else {
    const forLine = `${andList(forTeam.map((entry) => entry.name))} ${verbFor(
      forTeam.length,
      past
    )} ${team.name}.`;
    const againstLine = againstTeam.length && opponent
      ? `${andList(againstTeam.map((entry) => entry.name))} ${verbFor(
          againstTeam.length,
          past
        )} ${opponent}.`
      : opponent
        ? `Nobody on ${opponent}${pendingBit}.`
        : null;
    lede = [forLine, againstLine].filter(Boolean).join(" ");
  }
  return {
    event,
    href: `/picks/${event.slug}`,
    when: comparison.when,
    resultLine: comparison.resultLine,
    beatLine: beatLine(event, calls),
    forTeam,
    againstTeam,
    noCapturedPick,
    noCapturedPickOnGame,
    emptyFor: `No captured pick on ${team.name}${pendingBit}.`,
    emptyAgainst: opponent
      ? `Nobody on ${opponent}${pendingBit}.`
      : past
        ? "Nobody."
        : "Nobody yet.",
    lede,
  };
}

export function teamContent(
  team: Team,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): TeamContent {
  const involved = teamEvents(team.id, events);
  const games = involved
    .filter((event) => eventKind(event) === "game")
    .sort(
      (a, b) =>
        kickoffValue(a) - kickoffValue(b) || a.slug.localeCompare(b.slug)
    );
  const openGames = games.filter((event) => {
    const status = eventScanStatus(event, calls);
    return status === "open" || status === "grading";
  });
  const historicalGames = games
    .filter((event) => eventScanStatus(event, calls) === "final")
    .sort(
      (a, b) =>
        kickoffValue(b) - kickoffValue(a) || a.slug.localeCompare(b.slug)
    );
  const nextMatchup = openGames[0]
    ? teamMatchup(team, openGames[0], calls, pundits)
    : null;
  const upcoming = openGames
    .slice(1)
    .map((event) => teamMatchup(team, event, calls, pundits));
  const historical = historicalGames.map((event) =>
    teamMatchup(team, event, calls, pundits)
  );
  const otherMarkets = involved.filter((event) => eventKind(event) === "future");
  const noScheduledGame = nextMatchup == null;
  const hasTakes = teamHasTakes(team.id, events, calls);
  const noCapturedPick = nextMatchup
    ? nextMatchup.noCapturedPick
    : !hasTakes;
  const opponent = nextMatchup
    ? opponentName(team.id, nextMatchup.event)
    : null;
  const title = nextMatchup && opponent
    ? `${team.name}: who is picking them vs ${opponent}`
    : historical.length
      ? `${team.name}: tracked picks and results`
      : `${team.name}: tracked picks`;
  const bits: string[] = [];
  if (nextMatchup) {
    bits.push(`Next covered matchup: ${nextMatchup.event.title}.`);
    bits.push(nextMatchup.lede);
  } else {
    bits.push(`No scheduled game on the board for ${team.name}.`);
    if (!hasTakes) {
      bits.push("No captured pick yet.");
    } else if (historical[0]) {
      bits.push(
        `Last tracked result: ${historical[0].beatLine ?? historical[0].event.title}.`
      );
      bits.push(historical[0].lede);
    }
  }
  const lede = bits.join(" ");
  const focus = nextMatchup ?? historical[0] ?? null;
  const contextLinks: ContextLink[] = [
    { href: `/${team.sport}/`, label: sportChip(team.sport) },
  ];
  if (focus) {
    contextLinks.push({ href: focus.href, label: "Game comparison" });
    if (focus.event.season != null && focus.event.week != null) {
      contextLinks.push({
        href: weekArchivePath(team.sport, focus.event.season, focus.event.week),
        label: `Week ${focus.event.week} archive`,
      });
    }
  }
  return {
    title,
    h1: team.name,
    lede,
    description: `${lede} ${TRACKED_SUBSET_DISCLAIMER}`,
    disclaimer: TRACKED_SUBSET_DISCLAIMER,
    noScheduledGame,
    noCapturedPick,
    nextMatchup,
    upcoming,
    historical,
    otherMarkets,
    contextLinks,
  };
}

export type LeagueWeekLink = {
  season: number;
  week: number;
  label: string;
  href: string;
  openCount: number;
  finalCount: number;
};

export type LeagueContent = {
  title: string;
  h1: string;
  lede: string;
  description: string;
  disclaimer: string;
  sportLabel: string;
  currentWeek: LeagueWeekLink | null;
  weekLinks: LeagueWeekLink[];
  previous: { href: string; line: string } | null;
};

export function leagueContent(
  sport: Sport,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): LeagueContent {
  const slate = getLeagueSlate(sport, events, calls, pundits);
  const sportLabel = sportChip(sport);
  const h1 = sport === "nfl" ? "NFL" : "College football";
  const weekLinks: LeagueWeekLink[] = slate.weeks.map((week) => ({
    season: week.season,
    week: week.week,
    label: week.label,
    href: weekArchivePath(sport, week.season, week.week),
    openCount: week.open.length,
    finalCount: week.final.length,
  }));
  const currentWeek = weekLinks[0] ?? null;
  const openWeeks = weekLinks.filter((week) => week.openCount > 0);
  const finalOnly = currentWeek != null && openWeeks.length === 0;
  const title = currentWeek
    ? finalOnly
      ? `${sportLabel} Week ${currentWeek.week}: who called it`
      : `${sportLabel} Week ${currentWeek.week}: who picked whom`
    : `${sportLabel}: tracked picks this week`;
  let lede: string;
  if (!currentWeek) {
    lede = `No tracked ${sportLabel} games on the live board yet.`;
  } else if (finalOnly) {
    const n = currentWeek.finalCount;
    lede = `Week ${currentWeek.week} is final on this ${sportLabel} board. ${n} tracked game${
      n === 1 ? "" : "s"
    }. The Week ${currentWeek.week} archive is the permanent record.`;
  } else {
    const openBit =
      openWeeks.length === 1
        ? `${openWeeks[0].openCount} open game${
            openWeeks[0].openCount === 1 ? "" : "s"
          } in Week ${openWeeks[0].week}`
        : openWeeks
            .map(
              (week) =>
                `Week ${week.week} has ${week.openCount} open game${
                  week.openCount === 1 ? "" : "s"
                }`
            )
            .join(". ");
    lede = `Tracked picks on this week's ${sportLabel} slate. ${openBit}. Open games stay on this board; the Week ${currentWeek.week} archive is the permanent record.`;
  }
  return {
    title,
    h1,
    lede,
    description: `${lede} ${TRACKED_SUBSET_DISCLAIMER}`,
    disclaimer: TRACKED_SUBSET_DISCLAIMER,
    sportLabel,
    currentWeek,
    weekLinks,
    previous: slate.previous
      ? { href: slate.previous.href, line: slate.previous.line }
      : null,
  };
}

export type WeekDisagreement = {
  event: Event;
  href: string;
  line: string;
  receipts: GamePickEntry[];
};

export type WeekArchiveContent = {
  title: string;
  h1: string;
  lede: string;
  description: string;
  disclaimer: string;
  sportLabel: string;
  graded: boolean;
  trackedCount: number;
  record: { hits: number; misses: number; pending: number };
  disagreements: WeekDisagreement[];
  recap: string | null;
  contextLinks: ContextLink[];
};

function weekDisagreement(
  event: Event,
  calls: Call[],
  pundits: Pundit[]
): WeekDisagreement | null {
  const comparison = gameComparison(event, calls, pundits);
  if (!comparison.disagreement) return null;
  const past =
    eventScanStatus(event, calls) === "final" ||
    eventScanStatus(event, calls) === "grading";
  const winner = finalScoreParts(event, calls);
  let line = comparison.disagreement;
  if (past && winner) {
    const hitNames = comparison.entries
      .filter((entry) => entry.status === "hit")
      .map((entry) => entry.name);
    const missNames = comparison.entries
      .filter((entry) => entry.status === "miss")
      .map((entry) => entry.name);
    line = [
      `${winner.winner} beat ${winner.loser}.`,
      hitNames.length
        ? `${andList(hitNames)} called ${winner.winner}.`
        : null,
      missNames.length
        ? `${andList(missNames)} picked ${winner.loser}.`
        : null,
    ]
      .filter(Boolean)
      .join(" ");
  }
  return {
    event,
    href: `/picks/${event.slug}`,
    line,
    receipts: comparison.entries,
  };
}

export function weekArchiveContent(
  sport: Sport,
  season: number,
  week: number,
  events: Event[],
  calls: Call[],
  pundits: Pundit[]
): WeekArchiveContent {
  const sportLabel = sportChip(sport);
  const displayGames = getWeekArchiveGames(
    sport,
    season,
    week,
    events,
    calls,
    pundits
  );
  const record = weekRecord(gamesForWeek(sport, season, week, events), calls);
  const graded = record.hits + record.misses > 0;
  const disagreements = displayGames.flatMap((event) => {
    const row = weekDisagreement(event, calls, pundits);
    return row ? [row] : [];
  });
  const recap = disagreements.length
    ? disagreements
        .map((row) => `${row.event.title}: ${row.line}`)
        .join(" ")
    : null;
  const title = graded
    ? `${sportLabel} Week ${week}: who got them right (${season})`
    : `${sportLabel} Week ${week}: who picked whom (${season})`;
  const h1 = `${sportLabel} Week ${week}`;
  const openBit = record.pending
    ? `, with ${record.pending} still open`
    : "";
  const lede = graded
    ? `Tracked Week ${week} record: ${record.hits}–${record.misses} on ${
        record.hits + record.misses
      } graded pick${record.hits + record.misses === 1 ? "" : "s"}${openBit}. ${
        recap ?? "No verified disagreement in this tracked set."
      }`
    : `${displayGames.length} tracked game${
        displayGames.length === 1 ? "" : "s"
      } on the Week ${week} slate, ${record.pending} open pick${
        record.pending === 1 ? "" : "s"
      }. Results land on this same URL.`;
  return {
    title,
    h1,
    lede,
    description: `${lede} ${TRACKED_SUBSET_DISCLAIMER}`,
    disclaimer: TRACKED_SUBSET_DISCLAIMER,
    sportLabel,
    graded,
    trackedCount: displayGames.length,
    record,
    disagreements,
    recap,
    contextLinks: [
      { href: `/${sport}/`, label: `${sportLabel} slate` },
    ],
  };
}
