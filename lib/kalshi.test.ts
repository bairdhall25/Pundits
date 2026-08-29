import { describe, expect, it } from "vitest";
import { eventKalshiUrl, isKalshiUrl, kalshiEventUrl } from "./kalshi";

describe("isKalshiUrl", () => {
  it("accepts kalshi.com event pages", () => {
    expect(
      isKalshiUrl(
        "https://kalshi.com/markets/kxncaafgame/college-football-game/kxncaafgame-26aug29unctcu"
      )
    ).toBe(true);
    expect(isKalshiUrl("https://www.kalshi.com/markets/kxnflgame/nfl-game/x")).toBe(
      true
    );
  });

  it("rejects reprints and junk", () => {
    expect(
      isKalshiUrl(
        "https://www.si.com/prediction-markets/nc-state-vs-virginia-prediction-market-what-to-expect-in-college-football-week-0-01m0ww96dgq0"
      )
    ).toBe(false);
    expect(isKalshiUrl("https://oddsshopper.com/kalshi-college-football-picks")).toBe(
      false
    );
    expect(isKalshiUrl(null)).toBe(false);
    expect(isKalshiUrl("not a url")).toBe(false);
  });
});

describe("kalshiEventUrl", () => {
  it("builds CFB game, CFP, and NFL pages from the event ticker", () => {
    expect(kalshiEventUrl("KXNCAAFGAME-26AUG29NCSTUVA")).toBe(
      "https://kalshi.com/markets/kxncaafgame/college-football-game/kxncaafgame-26aug29ncstuva"
    );
    expect(kalshiEventUrl("KXNCAAFPLAYOFF-26-TEX")).toBe(
      "https://kalshi.com/markets/kxncaafplayoff/college-football-playoff/kxncaafplayoff-26-tex"
    );
    expect(kalshiEventUrl("KXNFLGAME-26SEP09NESEA")).toBe(
      "https://kalshi.com/markets/kxnflgame/nfl-game/kxnflgame-26sep09nesea"
    );
  });

  it("does not invent a path for an unknown series", () => {
    expect(kalshiEventUrl("KXSOMETHING-26-X")).toBeNull();
    expect(kalshiEventUrl("")).toBeNull();
  });
});

describe("eventKalshiUrl", () => {
  it("prefers a stored Kalshi sourceUrl over a constructed ticker path", () => {
    expect(
      eventKalshiUrl({
        ticker: "KXNCAAFGAME-26AUG29UNCTCU",
        sourceUrl:
          "https://kalshi.com/markets/kxncaafgame/college-football-game/kxncaafgame-26aug29unctcu",
      })
    ).toBe(
      "https://kalshi.com/markets/kxncaafgame/college-football-game/kxncaafgame-26aug29unctcu"
    );
  });

  it("falls back to the ticker when sourceUrl is a reprint", () => {
    expect(
      eventKalshiUrl({
        ticker: "KXNCAAFGAME-26AUG29NCSTUVA",
        sourceUrl: "https://www.si.com/prediction-markets/example",
      })
    ).toBe(
      "https://kalshi.com/markets/kxncaafgame/college-football-game/kxncaafgame-26aug29ncstuva"
    );
  });
});
