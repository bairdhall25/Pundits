import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadCalls, loadEvents, loadPundits, loadTeams } from "../lib/data";
import {
  eventOgCard,
  ogQuote,
  takeOgCard,
  type EventOgCard,
  type OgChip,
  type OgSide,
  type TakeOgCard,
} from "../lib/og";
import { mappedTakes } from "../lib/seo";

const ROOT = process.cwd();
const W = 1200;
const H = 630;
const GREEN = "#39ff14";
const INK = "#f5f5f5";
const MUTED = "#a3a3a3";
const CARD = "#141414";
const BG = "#0a0a0a";

const oswald = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff")
);
const inter = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")
);
const interBold = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff")
);

const photoCache = new Map<string, string>();

function photoUri(publicPath: string): string | null {
  const rel = publicPath.replace(/^\//, "");
  const abs = path.join(ROOT, "public", rel);
  if (!existsSync(abs)) return null;
  const hit = photoCache.get(abs);
  if (hit) return hit;
  const buf = readFileSync(abs);
  const mime =
    buf[0] === 0x89 && buf[1] === 0x50
      ? "image/png"
      : buf[0] === 0xff && buf[1] === 0xd8
        ? "image/jpeg"
        : buf[0] === 0x52 && buf[1] === 0x49
          ? "image/webp"
          : "image/png";
  const uri = `data:${mime};base64,${buf.toString("base64")}`;
  photoCache.set(abs, uri);
  return uri;
}

function headlineSize(text: string): number {
  if (text.length > 72) return 34;
  if (text.length > 54) return 42;
  if (text.length > 40) return 48;
  return 54;
}

function Chip({ chip }: { chip: OgChip }) {
  const long = chip.abbr.length > 3;
  return (
    <div
      style={{
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: chip.primary,
        color: chip.ink,
        fontFamily: "Oswald",
        fontSize: long ? 13 : 16,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {chip.abbr}
    </div>
  );
}

function FaceRow({ side, showPhotos }: { side: OgSide; showPhotos: boolean }) {
  if (side.empty) return null;
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
      {side.faces.slice(0, 3).map((face) => {
        const uri = showPhotos ? photoUri(face.photo) : null;
        return (
          <div
            key={face.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            {uri ? (
              <img
                src={uri}
                width={44}
                height={44}
                style={{ objectFit: "cover" }}
              />
            ) : null}
            <div
              style={{
                marginLeft: uri ? 10 : 0,
                color: INK,
                fontSize: 18,
                fontFamily: "Inter",
                fontWeight: 700,
              }}
            >
              {face.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SidePanel({
  side,
  showPhotos,
}: {
  side: OgSide;
  showPhotos: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: CARD,
        padding: "16px 20px 18px",
        borderLeft: side.picked ? `4px solid ${GREEN}` : "4px solid #141414",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {side.chip ? <Chip chip={side.chip} /> : null}
          <div
            style={{
              marginLeft: side.chip ? 12 : 0,
              fontFamily: "Oswald",
              fontSize: 22,
              color: INK,
              lineHeight: 1.1,
            }}
          >
            {side.label}
          </div>
        </div>
        <div
          style={{
            fontFamily: "Oswald",
            fontSize: 34,
            color: INK,
            marginLeft: 12,
          }}
        >
          {side.cents}
        </div>
      </div>
      <FaceRow side={side} showPhotos={showPhotos} />
    </div>
  );
}

function Wordmark({ right }: { right?: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Oswald", fontSize: 32, letterSpacing: 4 }}>
        <span style={{ color: GREEN }}>PUNDITS</span>
        <span style={{ color: INK }}>.</span>
      </div>
      {right ? (
        <div
          style={{
            color: MUTED,
            fontSize: 18,
            fontFamily: "Inter",
          }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
      }}
    >
      <div style={{ height: 8, width: "100%", background: GREEN }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "32px 48px 36px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TakeMarkup({ card }: { card: TakeOgCard }) {
  const uri = photoUri(card.photo);
  const quote = ogQuote(card.quote, 120);
  const quoteSize = quote.length > 90 ? 22 : 26;
  return (
    <Shell>
      <Wordmark right={card.when} />
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          marginTop: 24,
        }}
      >
        {uri ? (
          <img
            src={uri}
            width={300}
            height={300}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 300,
              height: 300,
              background: CARD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MUTED,
              fontFamily: "Oswald",
              fontSize: 96,
            }}
          >
            {card.name.slice(0, 1)}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 32,
            flex: 1,
          }}
        >
          <div
            style={{
              color: MUTED,
              fontSize: 15,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "Oswald",
            }}
          >
            {card.kicker}
          </div>
          <div
            style={{
              marginTop: 8,
              color: INK,
              fontFamily: "Oswald",
              fontSize: headlineSize(card.headline),
              lineHeight: 1.05,
            }}
          >
            {card.headline}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              borderLeft: `4px solid ${GREEN}`,
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                color: INK,
                fontFamily: "Inter",
                fontSize: quoteSize,
                lineHeight: 1.3,
                fontWeight: 400,
              }}
            >
              {`“${quote}”`}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 22 }}>
        <ScoreCell side={card.sides[0]} />
        <div style={{ width: 2, background: "#2a2a2a" }} />
        <ScoreCell side={card.sides[1]} />
      </div>
    </Shell>
  );
}

function ScoreCell({ side }: { side: OgSide }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: CARD,
        padding: "16px 20px",
        borderLeft: side.picked ? `6px solid ${GREEN}` : "6px solid #141414",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {side.chip ? <Chip chip={side.chip} /> : null}
        <div
          style={{
            marginLeft: side.chip ? 12 : 0,
            fontFamily: "Oswald",
            fontSize: 24,
            color: INK,
          }}
        >
          {side.label}
        </div>
      </div>
      <div style={{ fontFamily: "Oswald", fontSize: 40, color: INK, marginLeft: 12 }}>
        {side.cents}
      </div>
    </div>
  );
}

function EventMarkup({ card }: { card: EventOgCard }) {
  return (
    <Shell>
      <Wordmark right={card.when} />
      <div
        style={{
          marginTop: 28,
          color: INK,
          fontFamily: "Oswald",
          fontSize: headlineSize(card.title),
          lineHeight: 1.05,
        }}
      >
        {card.title}
      </div>
      <div style={{ display: "flex", marginTop: 28 }}>
        <SidePanel side={card.sides[0]} showPhotos />
        <div style={{ width: 2, background: "#2a2a2a" }} />
        <SidePanel side={card.sides[1]} showPhotos />
      </div>
    </Shell>
  );
}

export async function renderCardPng(tree: ReactNode): Promise<Buffer> {
  const svg = await satori(tree, {
    width: W,
    height: H,
    fonts: [
      { name: "Oswald", data: oswald, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
    ],
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
  });
  return Buffer.from(resvg.render().asPng());
}

export function takeTree(card: TakeOgCard) {
  return <TakeMarkup card={card} />;
}

export function eventTree(card: EventOgCard) {
  return <EventMarkup card={card} />;
}

function publicAbs(file: string) {
  return path.join(ROOT, "public", file.replace(/^\//, ""));
}

async function writePng(file: string, png: Buffer) {
  const abs = publicAbs(file);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, png);
}

async function newestMtime(files: string[]): Promise<number> {
  let max = 0;
  for (const file of files) {
    if (!existsSync(file)) continue;
    const info = await stat(file);
    if (info.mtimeMs > max) max = info.mtimeMs;
  }
  return max;
}

async function dirFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  return names.map((n) => path.join(dir, n));
}

async function shouldSkip(expected: number): Promise<boolean> {
  const takeDir = path.join(ROOT, "public/og/takes");
  const eventDir = path.join(ROOT, "public/og/events");
  const outs = [...(await dirFiles(takeDir)), ...(await dirFiles(eventDir))].filter((f) =>
    f.endsWith(".png")
  );
  if (outs.length !== expected) return false;
  const inputs = [
    path.join(ROOT, "data/calls.json"),
    path.join(ROOT, "data/events.json"),
    path.join(ROOT, "data/pundits.json"),
    path.join(ROOT, "data/teams.json"),
    path.join(ROOT, "lib/og.ts"),
    path.join(ROOT, "scripts/render-og.tsx"),
  ];
  const inMax = await newestMtime(inputs);
  const outMin = Math.min(...(await Promise.all(outs.map(async (f) => (await stat(f)).mtimeMs))));
  return outMin > inMax;
}

export async function renderAllOg(force = false): Promise<{ takes: number; events: number }> {
  const calls = loadCalls();
  const events = loadEvents();
  const pundits = loadPundits();
  const teams = loadTeams();
  const takes = mappedTakes(calls, events, pundits);
  const expected = takes.length + events.length;
  if (!force && (await shouldSkip(expected))) {
    return { takes: takes.length, events: events.length };
  }

  for (const dir of ["public/og/takes", "public/og/events"]) {
    const abs = path.join(ROOT, dir);
    await rm(abs, { recursive: true, force: true });
    await mkdir(abs, { recursive: true });
  }

  for (const take of takes) {
    const card = takeOgCard(take, calls, pundits, teams);
    try {
      const png = await renderCardPng(takeTree(card));
      await writePng(card.file, png);
    } catch (err) {
      throw new Error(`take ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const event of events) {
    const card = eventOgCard(event, calls, pundits, teams);
    try {
      const png = await renderCardPng(eventTree(card));
      await writePng(card.file, png);
    } catch (err) {
      throw new Error(`event ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  return { takes: takes.length, events: events.length };
}

function isCli() {
  const invoked = process.argv[1]?.replaceAll("\\", "/") ?? "";
  return invoked.includes("scripts/render-og");
}

if (isCli()) {
  const force = process.argv.includes("--force");
  renderAllOg(force)
    .then((result) => {
      console.log(`OG cards: ${result.takes} takes, ${result.events} events`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
