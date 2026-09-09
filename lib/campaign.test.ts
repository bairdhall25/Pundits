import { describe, expect, it } from "vitest";
import { sharePayload } from "./share-link";
import { canonicalizeDestination, decideNovelty } from "./social-select";
import {
  applyCampaignParams,
  botDistributedUrl,
  campaignEventParams,
  canonicalFromHref,
  nativeShareUrl,
  parseCampaignParams,
  persistCampaignFromSearch,
  type CampaignStore,
} from "./campaign";

function memoryStore(): CampaignStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem(key: string) {
      return key in data ? data[key] : null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

const gameCanonical = "https://pundits.pro/picks/unc-vs-tcu-2026/";

describe("campaign links", () => {
  it("adds attributable params to bot-distributed links without changing the canonical path", () => {
    const outbound = botDistributedUrl(gameCanonical, {
      kind: "original",
      pageType: "game",
    });
    expect(outbound).toBe(
      "https://pundits.pro/picks/unc-vs-tcu-2026/?utm_source=x&utm_medium=social&utm_campaign=organic-original&utm_content=game"
    );
    expect(canonicalFromHref(outbound)).toBe(gameCanonical);
    expect(canonicalizeDestination(outbound)).toBe(canonicalizeDestination(gameCanonical));
  });

  it("keeps native site share links on the canonical URL", () => {
    const native = nativeShareUrl("/picks/unc-vs-tcu-2026/finebaum");
    expect(native).toBe("https://pundits.pro/picks/unc-vs-tcu-2026/finebaum/");
    expect(native).not.toMatch(/utm_/);
    const payload = sharePayload({
      title: "Finebaum picks TCU",
      text: "Finebaum picks TCU",
      path: "/picks/unc-vs-tcu-2026/finebaum",
      image: "/og/takes/unc-vs-tcu-2026--finebaum.png",
      story: "/og/stories/takes/unc-vs-tcu-2026--finebaum.png",
    });
    expect(payload.url).toBe(native);
    expect(payload.tweetHref).toContain(encodeURIComponent(native));
    expect(payload.tweetHref).not.toMatch(/utm_/);
  });

  it("preserves campaign params across a trailing-slash redirect-style URL", () => {
    const withSlash = botDistributedUrl(gameCanonical, {
      kind: "reply",
      pageType: "receipt",
    });
    const missingSlash =
      "https://pundits.pro/picks/unc-vs-tcu-2026?utm_source=x&utm_medium=social&utm_campaign=organic-reply&utm_content=receipt";
    expect(parseCampaignParams(new URL(withSlash).search)).toEqual({
      source: "x",
      medium: "social",
      campaign: "organic-reply",
      content: "receipt",
    });
    expect(parseCampaignParams(new URL(missingSlash).search)).toEqual({
      source: "x",
      medium: "social",
      campaign: "organic-reply",
      content: "receipt",
    });
    expect(canonicalFromHref(missingSlash)).toBe(gameCanonical);
  });

  it("drops non-allowlisted query values so campaign fields cannot carry PII", () => {
    expect(
      parseCampaignParams(
        "utm_source=email@fan.example&utm_medium=social&utm_campaign=organic-original&utm_content=game&email=fan@example.com"
      )
    ).toEqual({
      medium: "social",
      campaign: "organic-original",
      content: "game",
    });
  });

  it("keeps campaign attribution after a later navigation with a clean URL", () => {
    const store = memoryStore();
    persistCampaignFromSearch(
      "utm_source=x&utm_medium=social&utm_campaign=organic-original&utm_content=game",
      store
    );
    expect(campaignEventParams("", persistCampaignFromSearch("", store))).toEqual({
      acq_source: "x",
      acq_medium: "social",
      acq_campaign: "organic-original",
      acq_content: "game",
    });
    expect(campaignEventParams("")).toEqual({});
  });

  it("does not treat campaign query variants as a new novelty destination", () => {
    const campaign = applyCampaignParams(gameCanonical, {
      source: "x",
      medium: "social",
      campaign: "organic-original",
      content: "game",
    });
    const decision = decideNovelty(gameCanonical, "pregame", {
      established: true,
      records: [
        {
          destination: campaign,
          state: "pregame",
          postedAt: "2026-09-08T12:00:00Z",
        },
      ],
    });
    expect(decision.action).toBe("skip");
    if (decision.action === "skip") expect(decision.reason).toBe("duplicate");
  });
});
