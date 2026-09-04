import { describe, expect, it } from "vitest";
import { cardFingerprint, stableSerialize } from "./fingerprint";

const base = {
  rendererVersion: "renderer-a",
  portraits: [{ id: "alice", hash: "portrait-alice" }],
  fonts: [{ name: "Oswald", hash: "font-oswald" }],
  width: 1200,
  height: 630,
  encoding: "png",
};

describe("stableSerialize", () => {
  it("ignores object key insertion order", () => {
    expect(stableSerialize({ b: 1, a: { d: 4, c: 3 } })).toBe(
      stableSerialize({ a: { c: 3, d: 4 }, b: 1 })
    );
  });

  it("does not serialize timestamps or absolute worktree paths from the model", () => {
    const encoded = stableSerialize({ headline: "Away", kicker: "Take" });
    expect(encoded).toBe('{"headline":"Away","kicker":"Take"}');
    expect(encoded).not.toMatch(/C:\\\\|\/Users\/|T\d{2}:\d{2}/);
  });
});

describe("cardFingerprint", () => {
  it("is a stable 64-character hash for the same resolved model regardless of key order", () => {
    const left = cardFingerprint({
      ...base,
      model: { headline: "Away", kicker: "Take", nested: { b: 2, a: 1 } },
    });
    const right = cardFingerprint({
      ...base,
      model: { nested: { a: 1, b: 2 }, kicker: "Take", headline: "Away" },
    });
    expect(left).toBe(right);
    expect(left).toMatch(/^[a-f0-9]{64}$/);
  });

  it("sorts portrait and font inputs so insertion order cannot false-miss", () => {
    const left = cardFingerprint({
      ...base,
      portraits: [
        { id: "bob", hash: "b" },
        { id: "alice", hash: "a" },
      ],
      fonts: [
        { name: "Inter", hash: "i" },
        { name: "Oswald", hash: "o" },
      ],
      model: { headline: "Away" },
    });
    const right = cardFingerprint({
      ...base,
      portraits: [
        { id: "alice", hash: "a" },
        { id: "bob", hash: "b" },
      ],
      fonts: [
        { name: "Oswald", hash: "o" },
        { name: "Inter", hash: "i" },
      ],
      model: { headline: "Away" },
    });
    expect(left).toBe(right);
  });

  it("changes when the renderer version changes", () => {
    const before = cardFingerprint({ ...base, model: { headline: "Away" } });
    const after = cardFingerprint({
      ...base,
      rendererVersion: "renderer-b",
      model: { headline: "Away" },
    });
    expect(after).not.toBe(before);
  });

  it("changes when a consumed portrait hash changes", () => {
    const before = cardFingerprint({ ...base, model: { headline: "Away" } });
    const after = cardFingerprint({
      ...base,
      portraits: [{ id: "alice", hash: "portrait-alice-changed" }],
      model: { headline: "Away" },
    });
    expect(after).not.toBe(before);
  });

  it("changes when dimensions or encoding change", () => {
    const landscape = cardFingerprint({ ...base, model: { headline: "Away" } });
    const story = cardFingerprint({
      ...base,
      width: 1080,
      height: 1920,
      model: { headline: "Away" },
    });
    expect(story).not.toBe(landscape);
  });
});
