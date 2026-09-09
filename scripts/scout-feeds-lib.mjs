/** Factory drop-alarm. Hunt uses a bounded recent-unprocessed episode queue, not "published today." */

export const DEFAULT_EPISODE_WINDOW_DAYS = 3;

export const FACTORIES = [
  {
    id: "finebaum",
    name: "Finebaum Show",
    sport: "ncaaf",
    kind: "apple",
    appleId: "687989405",
  },
  {
    id: "cover3",
    name: "Cover 3",
    sport: "ncaaf",
    kind: "apple",
    appleId: "1257913963",
  },
  {
    id: "bfw",
    name: "BFW Show",
    sport: "ncaaf",
    kind: "apple",
    appleId: "1375714621",
  },
  {
    id: "pate",
    name: "Josh Pate CFB Show",
    sport: "ncaaf",
    kind: "apple",
    appleId: "1485905502",
  },
  {
    id: "see-ball",
    name: "See Ball Get Ball",
    sport: "ncaaf",
    kind: "apple",
    appleId: "1769665459",
  },
  {
    id: "clay-travis",
    name: "Clay Travis Show",
    sport: "ncaaf",
    kind: "apple",
    appleId: "1498106610",
  },
  {
    id: "herd",
    name: "The Herd",
    sport: "nfl",
    kind: "apple",
    appleId: "1042368254",
  },
  {
    id: "eisen",
    name: "Rich Eisen Show",
    sport: "nfl",
    kind: "apple",
    appleId: "926642601",
  },
  {
    id: "mcafee",
    name: "Pat McAfee Show",
    sport: "both",
    kind: "apple",
    appleId: "1435183458",
  },
  {
    id: "gmfb",
    name: "GMFB",
    sport: "nfl",
    kind: "apple",
    appleId: "1171438277",
  },
];

export const HIGH_VALUE_SOURCE_IDS = [
  "gameday",
  "cover3",
  "see-ball",
  "clay-travis",
  "gmfb",
  "finebaum",
  "pate",
  "bfw",
  "herd",
  "eisen",
  "mcafee",
];

export function easternDay(at) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(at);
}

export function isShortLink(url) {
  return typeof url === "string" && /\/shorts\//i.test(url);
}

export function decodeXml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function isOffTopic(title, sport) {
  if (!/\bNBA\b|hoops tonight|timberwolves/i.test(title)) return false;
  if (sport !== "nfl" && sport !== "ncaaf" && sport !== "both") return false;
  return !/\bNFL\b|patriot|seahawk|49er|ram\b|bill|texan|clemson|lsu/i.test(
    title
  );
}

export function isWrongYear(title, published, now) {
  const year = easternDay(now).slice(0, 4);
  if (/\b2025\b/.test(title) && year === "2026") return true;
  const pub = Date.parse(published);
  if (!Number.isFinite(pub)) return false;
  const pubYear = easternDay(new Date(pub)).slice(0, 4);
  return /locks/i.test(title) && pubYear !== year;
}

function isRecapTitle(title) {
  if (/locks/i.test(title)) return false;
  return /upon further review|\bufr\b|instant reaction|\brecap\b|3\s*&\s*out/i.test(
    title
  );
}

export function episodeLocator(url) {
  if (!url) return "";
  const apple = String(url).match(/[?&]i=(\d+)/i);
  if (apple) return `i=${apple[1]}`;
  const yt = String(url).match(/(?:v=|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  if (yt) return yt[1];
  return url;
}

export function episodeId(factoryId, item) {
  const locator = episodeLocator(item?.url);
  if (factoryId && locator) return `${factoryId}:${locator.replace(/^i=/, "")}`;
  return `${factoryId || "unknown"}:${item?.published || ""}:${item?.title || ""}`;
}

export function loadEpisodeLedger(raw) {
  if (!raw) {
    return { version: 1, windowDays: DEFAULT_EPISODE_WINDOW_DAYS, episodes: [] };
  }
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.episodes)) {
    throw new Error("docs/scout-episodes.json must be an object with an episodes array");
  }
  return {
    version: raw.version ?? 1,
    windowDays: Number(raw.windowDays) || DEFAULT_EPISODE_WINDOW_DAYS,
    updated: raw.updated ?? "",
    note: raw.note ?? "",
    episodes: raw.episodes,
  };
}

export function priorEpisode(ledger, id) {
  return (ledger?.episodes ?? []).find((row) => row.id === id) ?? null;
}

function daysBetweenEastern(fromDay, toDay) {
  if (!fromDay || !toDay) return Number.POSITIVE_INFINITY;
  const from = Date.parse(`${fromDay}T00:00:00Z`);
  const to = Date.parse(`${toDay}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86400000);
}

function locksHunt(title) {
  return /locks|i.?ll take|who wins|moneyline|picks|predictions/i.test(title)
    ? "open"
    : "open if the chapter is a winner pick";
}

export function classifyItem(
  item,
  now,
  { sport, ledger, factoryId, windowDays = DEFAULT_EPISODE_WINDOW_DAYS } = {}
) {
  const title = item.title ?? "";
  const url = item.url ?? "";
  const published = item.published ?? "";
  const droppedEt = Number.isFinite(Date.parse(published))
    ? easternDay(new Date(published))
    : "";
  const id = episodeId(factoryId || item.factoryId, item);
  const prior = priorEpisode(ledger, id);
  const short = isShortLink(url);
  const base = {
    id,
    factoryId: factoryId || item.factoryId || "",
    title,
    url,
    droppedEt,
    published,
    locator: episodeLocator(url),
    short,
    inspected: Boolean(prior?.inspected),
  };

  if (isOffTopic(title, sport)) {
    return { ...base, status: "off-topic", hunt: "not a football locks hour" };
  }
  if (isWrongYear(title, published, now)) {
    return { ...base, status: "wrong-year", hunt: "drop (not this season)" };
  }

  const days = daysBetweenEastern(droppedEt, easternDay(now));
  const inWindow = Number.isFinite(days) && days >= 0 && days <= windowDays;

  if (prior?.inspected && prior.outcome === "dry" && !prior.reopenReason) {
    return {
      ...base,
      status: "dry",
      hunt: "already inspected dry; skip unless a new reason is stated",
    };
  }
  if (prior?.inspected && (prior.outcome === "hit" || prior.outcome === "opened")) {
    return {
      ...base,
      status: "inspected",
      hunt: "already processed",
    };
  }

  if (inWindow && isRecapTitle(title)) {
    return { ...base, status: "recap", hunt: "not LOCKS" };
  }

  if (inWindow) {
    const hunt = short
      ? "open if the official clip contains a complete named winner (duration is not a reject)"
      : locksHunt(title);
    return {
      ...base,
      status: days === 0 ? "today" : "unprocessed",
      hunt,
    };
  }

  return {
    ...base,
    status: "waiting",
    hunt: "outside the recent-unprocessed window",
  };
}

/**
 * All relevant recent episodes, not only the newest mixed-feed item.
 * Off-topic and wrong-year rows stay visible so a newer irrelevant drop
 * cannot hide an older inspectable episode.
 */
export function classifyQueue(
  items,
  now,
  { sport, ledger, factoryId, windowDays = DEFAULT_EPISODE_WINDOW_DAYS } = {}
) {
  return (items ?? []).map((item) =>
    classifyItem(item, now, { sport, ledger, factoryId, windowDays })
  );
}

export function inspectableEpisodes(classified) {
  return (classified ?? []).filter((row) =>
    row.status === "today" || row.status === "unprocessed"
  );
}

export function latestUsable(items, { sport } = {}) {
  const list = items ?? [];
  const usable = list.find(
    (item) => !isOffTopic(item.title, sport)
  );
  return usable ?? list[0] ?? null;
}

export function parseAppleLookup(json) {
  const results = json?.results;
  if (!Array.isArray(results)) return [];
  const items = [];
  for (const row of results) {
    if (row.wrapperType !== "podcastEpisode") continue;
    items.push({
      title: row.trackName ?? "",
      published: row.releaseDate ?? "",
      url: row.trackViewUrl ?? "",
    });
  }
  return items;
}

export function parseYoutubeAtom(xml) {
  const entries = String(xml ?? "").match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return entries.map((block) => {
    const title = decodeXml(
      block.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1] ?? ""
    );
    const published =
      block.match(/<published>([^<]+)<\/published>/i)?.[1] ?? "";
    const url =
      block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ??
      block.match(/<link>([^<]+)<\/link>/i)?.[1] ??
      "";
    return { title, published, url };
  });
}

function cell(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .trim();
}

export function formatFeeds(rows, now) {
  const asOf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);
  const lines = [
    "## Factory feeds",
    "",
    `As of ${asOf} ET. Hunt the recent-unprocessed queue, not only today's newest item. A feed check is not an inspection. Dry episodes stay dry unless a new reason is stated. Official short clips are eligible when they contain complete attributable evidence.`,
    "",
    "| factory | last drop (ET) | title | status | hunt |",
    "|---|---|---|---|---|",
  ];
  for (const row of rows) {
    lines.push(
      `| ${cell(row.factory)} | ${cell(row.droppedEt)} | ${cell(row.title)} | ${cell(row.status)} | ${cell(row.hunt)} |`
    );
  }
  return lines.join("\n");
}

export function appleLookupUrl(appleId) {
  return `https://itunes.apple.com/lookup?id=${appleId}&entity=podcastEpisode&limit=12`;
}

export function youtubeFeedUrl(channelId) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

export function mergeDiscoveredEpisodes(ledger, factoryId, items) {
  const next = {
    version: 1,
    windowDays: ledger?.windowDays || DEFAULT_EPISODE_WINDOW_DAYS,
    episodes: [...(ledger?.episodes ?? [])],
  };
  const seen = new Set(next.episodes.map((row) => row.id));
  for (const item of items ?? []) {
    const id = episodeId(factoryId, item);
    if (seen.has(id)) continue;
    seen.add(id);
    next.episodes.push({
      id,
      factoryId,
      title: item.title ?? "",
      published: item.published ?? "",
      url: item.url ?? "",
      locator: episodeLocator(item.url),
      inspected: false,
      outcome: "discovered",
      note: "Feed check only. Not inspected.",
    });
  }
  return next;
}
