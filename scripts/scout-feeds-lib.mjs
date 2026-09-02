/** Factory drop-alarm. Posted = last usable item's pubDate is today's Eastern date. */

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

export function classifyItem(item, now, { sport } = {}) {
  const title = item.title ?? "";
  const url = item.url ?? "";
  const published = item.published ?? "";
  const droppedEt = Number.isFinite(Date.parse(published))
    ? easternDay(new Date(published))
    : "";
  if (isOffTopic(title, sport)) {
    return {
      title,
      url,
      droppedEt,
      status: "off-topic",
      hunt: "not a football locks hour",
    };
  }
  if (isShortLink(url)) {
    return {
      title,
      url,
      droppedEt,
      status: "short",
      hunt: "skip clip; wait for long episode",
    };
  }
  if (isWrongYear(title, published, now)) {
    return {
      title,
      url,
      droppedEt,
      status: "wrong-year",
      hunt: "drop (not this season)",
    };
  }
  if (droppedEt === easternDay(now) && isRecapTitle(title)) {
    return {
      title,
      url,
      droppedEt,
      status: "recap",
      hunt: "not LOCKS",
    };
  }
  if (droppedEt === easternDay(now)) {
    return {
      title,
      url,
      droppedEt,
      status: "today",
      hunt: /locks|i.?ll take|who wins|moneyline/i.test(title)
        ? "open"
        : "open if the chapter is a winner pick",
    };
  }
  return {
    title,
    url,
    droppedEt,
    status: "waiting",
    hunt: "do not burn tokens",
  };
}

export function latestUsable(items, { sport } = {}) {
  const list = items ?? [];
  const usable = list.find(
    (item) => !isShortLink(item.url) && !isOffTopic(item.title, sport)
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
    `As of ${asOf} ET. Posted = last long episode's pubDate is today's Eastern date. Shorts and last year's LOCKS are not a hunt.`,
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
