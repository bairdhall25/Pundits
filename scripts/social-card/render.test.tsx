import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  loadCalls,
  loadEvents,
  loadPundits,
  loadTeams,
} from "../../lib/data";
import { mappedTakes } from "../../lib/seo";
import {
  resolveEventSocialCard,
  resolvePunditSocialCard,
  resolveTakeSocialCard,
} from "../../lib/social-card";
import { renderCardPng } from "../render-og";
import { landscapeSocialTree } from "./render";

describe("landscape social renderer", () => {
  it("renders canonical Split, Quote, pundit, and empty-event fixtures", async () => {
    const calls = loadCalls();
    const events = loadEvents();
    const pundits = loadPundits();
    const teams = loadTeams();
    const takes = mappedTakes(calls, events, pundits);

    const event = events.find((candidate) => candidate.slug === "clemson-at-lsu-2026");
    const emptyEvent = events.find((candidate) => candidate.slug === "seahawks-sb-2026");
    const take = takes.find(
      (candidate) =>
        candidate.event.slug === "clemson-at-lsu-2026" &&
        candidate.pundit.id === "wrighster"
    );
    const pundit = pundits.find((candidate) => candidate.id === "finebaum");

    expect(event).toBeDefined();
    expect(emptyEvent).toBeDefined();
    expect(take).toBeDefined();
    expect(pundit).toBeDefined();

    const models = [
      resolveEventSocialCard(event!, calls, pundits, teams),
      resolveEventSocialCard(emptyEvent!, calls, pundits, teams),
      resolveTakeSocialCard(take!, calls, pundits, teams),
      resolvePunditSocialCard(pundit!, calls),
    ];
    const pngs = await Promise.all(
      models.map((model) => renderCardPng(landscapeSocialTree(model)))
    );

    for (const png of pngs) {
      const metadata = await sharp(png).metadata();
      expect(metadata.format).toBe("png");
      expect(metadata.width).toBe(1200);
      expect(metadata.height).toBe(630);
    }
  }, 30_000);
});
