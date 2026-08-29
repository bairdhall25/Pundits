const STATUS_ORDER = {
  "empty-side": 0,
  "off-home": 1,
  thin: 2,
  dense: 3,
};

export function isGameEvent(event) {
  if (!event || event.kind === "future") return false;
  if (event.kind === "game") return true;
  const kick = Boolean(event.kickoff || event.kickoffDate);
  const away = Boolean(event.awayTeam || event.awayTeamId);
  const home = Boolean(event.homeTeam || event.homeTeamId);
  return kick && away && home;
}

export function mappedHardForEvent(calls, slug) {
  const yes = [];
  const no = [];
  for (const call of calls ?? []) {
    if (call.kind !== "hard") continue;
    if (call.eventSlug !== slug) continue;
    if (call.side !== "yes" && call.side !== "no") continue;
    if (!call.punditId) continue;
    if (call.side === "yes") yes.push(call.punditId);
    else no.push(call.punditId);
  }
  return { yes, no };
}

export function densityStatus(yes, no, { offHome = false } = {}) {
  const y = yes.length;
  const n = no.length;
  if (offHome && y + n === 0) return "off-home";
  if (y === 0 || n === 0) return "empty-side";
  if (y + n < 3) return "thin";
  return "dense";
}

export function huntHint(event, yes, no, status) {
  if (status === "dense") return "skip";
  if (status === "off-home") return "one roster SU to propose onHome";
  if (status === "thin") return "keep hunting (stack OK)";
  const away = event.awayTeam ?? "away";
  const home = event.homeTeam ?? "home";
  if (yes.length === 0 && no.length === 0) return "both sides empty";
  const first =
    yes.length === 0 ? `${away} YES first` : `${home} NO first`;
  if (yes.length + no.length < 3) return `${first}, then a third voice`;
  return first;
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
    if (!isGameEvent(event)) continue;
    const listedOffHome = !event.onHome && offHomeSet.has(event.slug);
    if (!event.onHome && !listedOffHome) continue;
    if (seen.has(event.slug)) continue;
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

function cell(ids) {
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
      `| ${row.eventSlug} | ${row.sport} | ${cell(row.yes)} | ${cell(row.no)} | ${row.status} | ${row.hunt} |`
    );
  }
  return lines.join("\n");
}
