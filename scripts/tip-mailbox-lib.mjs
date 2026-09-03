export const COMMUNITY_TIPS_HEADING = "## Community tips";
export const COMMUNITY_TIPS_HEADER = `${COMMUNITY_TIPS_HEADING}

| tipId | receivedAt | discovery | lane | pundit hint | event hint | sourceUrl | where to look | status |
|---|---|---|---|---|---|---|---|---|`;

const SHOW_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "podcasts.apple.com",
  "open.spotify.com",
  "iheart.com",
  "www.iheart.com",
  "megaphone.fm",
  "simplecast.com",
  "podbean.com",
  "soundcloud.com",
]);

function cleanPublicText(value, max = 240) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function escapeMarkdownCell(value, max = 240) {
  return cleanPublicText(value, max)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\|/g, "\\|");
}

export function routeTipLane(sourceUrl) {
  let host = "";
  try {
    host = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return "News";
  }
  if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
    return "X";
  }
  if (SHOW_HOSTS.has(host) || [...SHOW_HOSTS].some((known) => host.endsWith(`.${known}`))) {
    return "Shows";
  }
  return "News";
}

function eventHint(tip) {
  const event = tip.eventSlugHint || tip.eventHint || "(none)";
  return tip.sideHint ? `${event} · ${tip.sideHint.toUpperCase()}` : event;
}

export function renderCommunityTipRow(tip) {
  const cells = [
    escapeMarkdownCell(tip.id, 100),
    escapeMarkdownCell(tip.receivedAt, 40),
    escapeMarkdownCell(tip.discovery, 20),
    routeTipLane(tip.sourceUrl),
    escapeMarkdownCell(tip.punditHint || "(not provided)", 120),
    escapeMarkdownCell(eventHint(tip), 180),
    escapeMarkdownCell(tip.sourceUrl, 2048),
    escapeMarkdownCell(tip.timestampHint || "", 160),
    "pending",
  ];
  return `| ${cells.join(" | ")} |`;
}

function tipIds(markdown) {
  return new Set(
    [...markdown.matchAll(/^\|\s*(tip:[^|\s]+|tip-[^|\s]+|[0-9a-f-]{20,})\s*\|/gim)].map(
      (match) => match[1]
    )
  );
}

function ensureBlock(markdown) {
  if (markdown.includes(COMMUNITY_TIPS_HEADING)) return markdown;
  const marker = markdown.search(/^## (Shows|X|News) pass\b/m);
  const block = `${COMMUNITY_TIPS_HEADER}\n`;
  if (marker < 0) return `${markdown.trimEnd()}\n\n${block}`;
  return `${markdown.slice(0, marker).trimEnd()}\n\n${block}\n${markdown.slice(marker)}`;
}

export function insertCommunityTips(markdown, tips) {
  let next = ensureBlock(markdown);
  const existing = tipIds(next);
  const rows = tips.filter((tip) => !existing.has(tip.id)).map(renderCommunityTipRow);
  if (!rows.length) return next;

  const start = next.indexOf(COMMUNITY_TIPS_HEADING);
  const afterHeading = start + COMMUNITY_TIPS_HEADING.length;
  const nextHeadingOffset = next.slice(afterHeading).search(/^## /m);
  const end = nextHeadingOffset < 0 ? next.length : afterHeading + nextHeadingOffset;
  const block = next.slice(start, end).trimEnd();
  const updated = `${block}\n${rows.join("\n")}\n\n`;
  return `${next.slice(0, start)}${updated}${next.slice(end).replace(/^\s+/, "")}`;
}
