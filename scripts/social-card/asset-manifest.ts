import { archiveWeeks } from "../../lib/archive";
import { callsForPundit, isMapped, toActivityRecord } from "../../lib/data";
import {
  eventOgCard,
  ogEventPath,
  ogPunditPath,
  ogStoryEventPath,
  ogStoryPunditPath,
  ogStoryTakePath,
  ogTakePath,
  ogTeamPath,
  ogWeekPath,
  punditOgCard,
  takeOgCard,
} from "../../lib/og";
import { mappedTakes } from "../../lib/seo";
import {
  SOCIAL_PAGE_KEYS,
  ogPagePath,
  resolveEventSocialCard,
  resolvePageSocialCard,
  resolvePunditSocialCard,
  resolveTakeSocialCard,
  resolveTeamSocialCard,
  resolveWeekSocialCard,
} from "../../lib/social-card";
import type { Call, Event, Pundit, Team } from "../../lib/types";
import { cardFingerprint, type FingerprintFont } from "./fingerprint";
import { SOCIAL_SIZE } from "./tokens";

export const STORY_SIZE = { width: 1080, height: 1920 } as const;

export type AssetKind = "take" | "event" | "pundit" | "team" | "week" | "page";
export type AssetFormat = "landscape" | "story";

export type FingerprintContext = {
  rendererVersions: { landscape: string; story: string };
  fontHashes: FingerprintFont[];
  portraitHash: (publicPath: string | null) => string;
  encoding?: string;
};

export type ManifestRow = {
  publicPath: string;
  width: number;
  height: number;
  kind: AssetKind;
  format: AssetFormat;
  objectId: string;
  model: unknown;
  fingerprint: string;
  dependencies: {
    portraits: string[];
    renderer: string;
    fonts: string[];
  };
};

export type ManifestData = {
  calls: Call[];
  events: Event[];
  pundits: Pundit[];
  teams: Team[];
};

export function collectPortraitPaths(model: unknown): string[] {
  const found = new Set<string>();
  const visit = (value: unknown, key?: string) => {
    if (value == null) return;
    if (typeof value === "string") {
      if ((key === "portrait" || key === "photo") && value.startsWith("/")) {
        found.add(value);
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (typeof value === "object") {
      for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
        visit(child, childKey);
      }
    }
  };
  visit(model);
  return [...found].sort();
}

function rowFor(
  publicPath: string,
  kind: AssetKind,
  format: AssetFormat,
  objectId: string,
  model: unknown,
  context: FingerprintContext
): ManifestRow {
  const size = format === "story" ? STORY_SIZE : SOCIAL_SIZE;
  const renderer =
    format === "story" ? context.rendererVersions.story : context.rendererVersions.landscape;
  const portraits = collectPortraitPaths(model);
  const encoding = context.encoding ?? "png";
  return {
    publicPath,
    width: size.width,
    height: size.height,
    kind,
    format,
    objectId,
    model,
    fingerprint: cardFingerprint({
      model,
      rendererVersion: renderer,
      portraits: portraits.map((portraitPath) => ({
        id: portraitPath,
        hash: context.portraitHash(portraitPath),
      })),
      fonts: context.fontHashes,
      width: size.width,
      height: size.height,
      encoding,
    }),
    dependencies: {
      portraits,
      renderer,
      fonts: context.fontHashes.map((font) => font.name),
    },
  };
}

export function buildAssetManifest(
  data: ManifestData,
  context: FingerprintContext
): ManifestRow[] {
  const takes = mappedTakes(data.calls, data.events, data.pundits);
  const weeks = archiveWeeks(data.events);
  const rows: ManifestRow[] = [];

  for (const take of takes) {
    const objectId = `${take.event.slug}--${take.pundit.id}`;
    rows.push(
      rowFor(
        ogTakePath(take.event.slug, take.pundit.id),
        "take",
        "landscape",
        objectId,
        resolveTakeSocialCard(take, data.calls, data.pundits, data.teams),
        context
      )
    );
    rows.push(
      rowFor(
        ogStoryTakePath(take.event.slug, take.pundit.id),
        "take",
        "story",
        objectId,
        takeOgCard(take, data.calls, data.pundits, data.teams),
        context
      )
    );
  }

  for (const event of data.events) {
    rows.push(
      rowFor(
        ogEventPath(event.slug),
        "event",
        "landscape",
        event.slug,
        resolveEventSocialCard(event, data.calls, data.pundits, data.teams),
        context
      )
    );
    rows.push(
      rowFor(
        ogStoryEventPath(event.slug),
        "event",
        "story",
        event.slug,
        eventOgCard(event, data.calls, data.pundits, data.teams),
        context
      )
    );
  }

  for (const pundit of data.pundits) {
    const latest = callsForPundit(pundit.id, data.calls).find(isMapped);
    const record = toActivityRecord(pundit, data.calls);
    rows.push(
      rowFor(
        ogPunditPath(pundit.id),
        "pundit",
        "landscape",
        pundit.id,
        resolvePunditSocialCard(pundit, data.calls),
        context
      )
    );
    rows.push(
      rowFor(
        ogStoryPunditPath(pundit.id),
        "pundit",
        "story",
        pundit.id,
        punditOgCard(record, latest),
        context
      )
    );
  }

  for (const team of data.teams) {
    rows.push(
      rowFor(
        ogTeamPath(team.id),
        "team",
        "landscape",
        team.id,
        resolveTeamSocialCard(team, data.events, data.calls, data.pundits),
        context
      )
    );
  }

  for (const week of weeks) {
    const objectId = `${week.sport}-${week.season}-week-${week.week}`;
    rows.push(
      rowFor(
        ogWeekPath(week.sport, week.season, week.week),
        "week",
        "landscape",
        objectId,
        resolveWeekSocialCard(
          week.sport,
          week.season,
          week.week,
          data.events,
          data.calls,
          data.pundits,
          data.teams
        ),
        context
      )
    );
  }

  const pageData = {
    events: data.events,
    calls: data.calls,
    pundits: data.pundits,
  };
  for (const key of SOCIAL_PAGE_KEYS) {
    rows.push(
      rowFor(
        ogPagePath(key),
        "page",
        "landscape",
        key,
        resolvePageSocialCard(key, "landscape", pageData),
        context
      )
    );
  }

  return rows;
}
