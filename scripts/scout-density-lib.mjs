const STATUS_ORDER = {
  "empty-side": 0,
  "off-home": 1,
  thin: 2,
  dense: 3,
};

export function isGameEvent(event) {
  if (!event || event.kind === "future") return false;
  if (event.kind === "game") return true;

  const hasKickoff = Boolean(event.kickoff || event.kickoffDate);
  const hasAway = Boolean(event.awayTeam || event.awayTeamId);
  const hasHome = Boolean(event.homeTeam || event.homeTeamId);
  return hasKickoff && hasAway && hasHome;
}

export function mappedHardForEvent(calls, slug) {
  const yes = [];
  const no = [];

  for (const call of calls ?? []) {
    if (call.kind !== "hard" || call.eventSlug !== slug) continue;
    if ((call.side !== "yes" && call.side !== "no") || !call.punditId) continue;
    if (call.side === "yes") yes.push(call.punditId);
    else no.push(call.punditId);
  }

  return { yes, no };
}

export function densityStatus(yes, no, { offHome = false } = {}) {
  const total = yes.length + no.length;
  if (offHome && total === 0) return "off-home";
  if (yes.length === 0 || no.length === 0) return "empty-side";
  if (total < 3) return "thin";
  return "dense";
}

export function huntHint(event, yes, no, status) {
  if (status === "dense") return "skip";
  if (status === "off-home") return "one roster SU to propose onHome";
  if (status === "thin") return "keep hunting (stack OK)";

  const away = event.awayTeam ?? "away";
  const home = event.homeTeam ?? "home";
  if (yes.length === 0 && no.length === 0) return "both sides empty";

  const first = yes.length === 0 ? `${away} YES first` : `${home} NO first`;
  return yes.length + no.length < 3 ? `${first}, then a third voice` : first;
}

export function scoreEvent(event, calls, { offHome = false } = {}) {
  const { yes, no } = mappedHardForEvent(calls, event.slug);
  const status = densityStatus(yes, no, { offHome });
  return {
    eventSlug: event.slug,
    sport: event.sport,
    yes,
    no,
    status,
    hunt: huntHint(event, yes, no, status),
  };
}

export function scoreSlate({ events, calls, bringOntoHome = [] }) {
  const offHomeSet = new Set(bringOntoHome);
  const seen = new Set();
  const rows = [];

  for (const event of events ?? []) {
    if (!isGameEvent(event) || seen.has(event.slug)) continue;
    const listedOffHome = !event.onHome && offHomeSet.has(event.slug);
    if (!event.onHome && !listedOffHome) continue;

    seen.add(event.slug);
    rows.push(scoreEvent(event, calls, { offHome: listedOffHome }));
  }

  rows.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.eventSlug.localeCompare(b.eventSlug)
  );
  return rows;
}

export function loadBringOntoHome(raw) {
  if (!Array.isArray(raw) || raw.some((slug) => typeof slug !== "string" || !slug)) {
    throw new Error("docs/bring-onto-home.json must be a JSON array of slugs");
  }
  return raw;
}

function peopleCell(ids) {
  return ids.length ? ids.join(", ") : "(none)";
}

export function formatDispatch(rows) {
  const lines = [
    "## Dispatch",
    "",
    "| eventSlug | sport | yes | no | status | hunt |",
    "|---|---|---|---|---|---|",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.eventSlug} | ${row.sport} | ${peopleCell(row.yes)} | ${peopleCell(row.no)} | ${row.status} | ${row.hunt} |`
    );
  }

  return lines.join("\n");
}
