import { describe, expect, it } from "vitest";
import {
  escapeMarkdownCell,
  insertCommunityTips,
  renderCommunityTipRow,
  routeTipLane,
} from "./tip-mailbox-lib.mjs";

const tip = {
  id: "tip-123",
  receivedAt: "2026-09-03T12:00:00.000Z",
  discovery: "website",
  sourceUrl: "https://x.com/example/status/1",
  punditHint: "Example Pundit",
  eventHint: "Clemson at LSU",
  eventSlugHint: "clemson-at-lsu-2026",
  sideHint: "yes",
  timestampHint: "0:42 | decisive pick",
  placement: "event",
};

describe("community tip mailbox", () => {
  it.each([
    ["https://x.com/example/status/1", "X"],
    ["https://twitter.com/example/status/1", "X"],
    ["https://www.youtube.com/watch?v=abc", "Shows"],
    ["https://podcasts.apple.com/us/podcast/example/id1?i=2", "Shows"],
    ["https://example.com/column", "News"],
  ])("routes %s to %s Scout", (url, lane) => {
    expect(routeTipLane(url)).toBe(lane);
  });

  it("escapes public text before rendering Markdown", () => {
    expect(escapeMarkdownCell("<b>one | two</b>\nnext")).toBe(
      "&lt;b&gt;one \\| two&lt;/b&gt; next"
    );
  });

  it("renders a bounded pending routing row", () => {
    const row = renderCommunityTipRow(tip);
    expect(row).toContain("| tip-123 | 2026-09-03T12:00:00.000Z | website | X |");
    expect(row).toContain("clemson-at-lsu-2026 · YES");
    expect(row).toContain("0:42 \\| decisive pick");
    expect(row).toMatch(/\| pending \|$/);
  });

  it("keeps source-only tips visible for Scout", () => {
    const row = renderCommunityTipRow({ ...tip, punditHint: undefined });
    expect(row).toContain("| (not provided) |");
    expect(row).toContain("https://x.com/example/status/1");
  });

  it("inserts the block before Scout passes without wiping content", () => {
    const run = `<!-- pundits-run -->\n\n## Dispatch\n\nkeep dispatch\n\n## Shows pass 2026-09-03\n\nkeep shows\n`;
    const next = insertCommunityTips(run, [tip]);
    expect(next.indexOf("## Community tips")).toBeLessThan(next.indexOf("## Shows pass"));
    expect(next).toContain("keep dispatch");
    expect(next).toContain("keep shows");
    expect(next).toContain("tip-123");
  });

  it("appends to an existing block once", () => {
    const first = insertCommunityTips("## Community tips\n\n", [tip]);
    const second = insertCommunityTips(first, [tip, { ...tip, id: "tip-456" }]);
    expect(second.match(/tip-123/g)).toHaveLength(1);
    expect(second.match(/tip-456/g)).toHaveLength(1);
  });
});
