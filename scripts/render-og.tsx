import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import {
  callsForPundit,
  loadCalls,
  loadEvents,
  loadPundits,
  loadTeams,
  toActivityRecord,
} from "../lib/data";
import { archiveWeeks } from "../lib/archive";
import {
  eventOgCard,
  ogQuote,
  ogStoryEventPath,
  ogStoryPunditPath,
  ogStoryTakePath,
  punditOgCard,
  takeOgCard,
  teamOgCard,
  weekOgCard,
  type EventOgCard,
  type OgChip,
  type OgFace,
  type OgSide,
  type PunditOgCard,
  type TakeOgCard,
  type TeamOgCard,
  type WeekOgCard,
} from "../lib/og";
import { mappedTakes } from "../lib/seo";
import {
  resolveEventSocialCard,
  resolvePunditSocialCard,
  resolveTakeSocialCard,
} from "../lib/social-card";
import { landscapeSocialTree } from "./social-card/render";

const ROOT = process.cwd();
const W = 1200;
const H = 630;
const STORY_W = 1080;
const STORY_H = 1920;
const GREEN = "#39ff14";
const RED = "#ff4d4f";
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
const plexMono = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff")
);
const plexMonoSemi = readFileSync(
  path.join(ROOT, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff")
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

function Chip({ chip, size = 48 }: { chip: OgChip; size?: number }) {
  const long = chip.abbr.length > 3;
  const font = size >= 60 ? (long ? 18 : 22) : long ? 13 : 16;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: chip.primary,
        color: chip.ink,
        fontFamily: "Oswald",
        fontSize: font,
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
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", flex: 1 }}>
      {side.faces.slice(0, 3).map((face) => {
        const uri = showPhotos ? photoUri(face.photo) : null;
        const quote = face.quote ? storyQuote(face.quote, 90) : null;
        return (
          <div
            key={face.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginTop: 12,
            }}
          >
            {uri ? (
              <img
                src={uri}
                width={72}
                height={72}
                style={{ objectFit: "cover" }}
              />
            ) : null}
            <div
              style={{
                marginLeft: uri ? 14 : 0,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div
                style={{
                  color: INK,
                  fontSize: 24,
                  fontFamily: "Inter",
                  fontWeight: 700,
                }}
              >
                {face.name}
              </div>
              {quote ? (
                <div
                  style={{
                    color: MUTED,
                    fontSize: 20,
                    lineHeight: 1.3,
                    marginTop: 6,
                    fontFamily: "Inter",
                  }}
                >
                  {`“${quote}”`}
                </div>
              ) : null}
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
        padding: "22px 24px 24px",
        borderLeft: side.picked ? `6px solid ${GREEN}` : "6px solid #141414",
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
          {side.chip ? <Chip chip={side.chip} size={64} /> : null}
          <div
            style={{
              marginLeft: side.chip ? 14 : 0,
              fontFamily: "Oswald",
              fontSize: 32,
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
            fontSize: 56,
            color: INK,
            marginLeft: 12,
          }}
        >
          {side.cents}
        </div>
      </div>
      {side.empty ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            color: MUTED,
            fontSize: 22,
            fontFamily: "Inter",
          }}
        >
          No verified pick yet
        </div>
      ) : (
        <FaceRow side={side} showPhotos={showPhotos} />
      )}
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
      <div style={{ display: "flex", flexShrink: 0, fontFamily: "Oswald", fontSize: 32, letterSpacing: 4 }}>
        <span style={{ color: GREEN }}>PUNDITS</span>
        <span style={{ color: INK }}>.</span>
      </div>
      {right ? (
        <div
          style={{
            color: MUTED,
            fontSize: 18,
            fontFamily: "Inter",
            maxWidth: 720,
            textAlign: "right",
            flexShrink: 1,
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
        position: "relative",
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

function Stamp({
  status,
  scale = 1,
  top,
  right,
}: {
  status: "hit" | "miss";
  scale?: number;
  top: number;
  right: number;
}) {
  const color = status === "hit" ? GREEN : RED;
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        display: "flex",
        transform: "rotate(-6deg)",
        border: `${Math.round(5 * scale)}px solid ${color}`,
        color,
        fontFamily: "Oswald",
        fontSize: Math.round(44 * scale),
        letterSpacing: Math.round(10 * scale),
        padding: `${Math.round(6 * scale)}px ${Math.round(20 * scale)}px`,
      }}
    >
      {status === "hit" ? "HIT" : "MISS"}
    </div>
  );
}

function TakeMarkup({ card }: { card: TakeOgCard }) {
  const uri = photoUri(card.photo);
  const quote = ogQuote(card.quote, 100);
  const quoteSize = quote.length > 78 ? 21 : 25;
  const verdictColor = card.status === "hit" ? GREEN : card.status === "miss" ? RED : GREEN;
  return (
    <Shell>
      <Wordmark right={card.when} />
      {card.status !== "pending" ? (
        <Stamp status={card.status} top={88} right={56} />
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          marginTop: 24,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {uri ? (
          <img
            src={uri}
            width={280}
            height={280}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 280,
              height: 280,
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
            minWidth: 0,
            overflow: "hidden",
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
              maxWidth: 760,
            }}
          >
            {card.headline}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              borderLeft: `4px solid ${verdictColor}`,
              paddingLeft: 16,
              maxWidth: 760,
              maxHeight: 76,
              overflow: "hidden",
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
        <ScoreCell side={card.sides[0]} accent={verdictColor} />
        <div style={{ width: 2, background: "#2a2a2a" }} />
        <ScoreCell side={card.sides[1]} accent={verdictColor} />
      </div>
      {card.result ? (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 20,
            letterSpacing: 3,
            color: INK,
          }}
        >
          {`FINAL: ${card.result.toUpperCase()}`}
        </div>
      ) : null}
      <Legal text="Not a bet they placed · hypothetical $100 at the freeze" />
    </Shell>
  );
}

function ScoreCell({ side, accent }: { side: OgSide; accent?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: CARD,
        padding: "16px 20px",
        borderLeft: side.picked ? `6px solid ${accent ?? GREEN}` : "6px solid #141414",
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
      <div style={{ fontFamily: "IBM Plex Mono", fontWeight: 600, fontSize: 36, color: INK, marginLeft: 12 }}>
        {side.cents}
      </div>
    </div>
  );
}

function eventHeadlineSize(text: string): number {
  if (text.length > 48) return 48;
  if (text.length > 32) return 58;
  return 68;
}

function EventMarkup({ card }: { card: EventOgCard }) {
  return (
    <Shell>
      <Wordmark right={card.when} />
      <div
        style={{
          marginTop: 16,
          color: GREEN,
          fontFamily: "Oswald",
          fontSize: 18,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Expert pick split
      </div>
      <div
        style={{
          marginTop: 4,
          color: INK,
          fontFamily: "Oswald",
          fontSize: eventHeadlineSize(card.title),
          lineHeight: 1.02,
        }}
      >
        {card.title}
      </div>
      <div style={{ display: "flex", flex: 1, marginTop: 18, minHeight: 0 }}>
        <SidePanel side={card.sides[0]} showPhotos />
        <div style={{ width: 2, background: "#2a2a2a" }} />
        <SidePanel side={card.sides[1]} showPhotos />
      </div>
      <Legal text="Not bets they placed" />
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginRight: 42 }}>
      <div style={{ color: MUTED, fontFamily: "Inter", fontSize: 14, textTransform: "uppercase", letterSpacing: 2 }}>
        {label}
      </div>
      <div style={{ color: INK, fontFamily: "Oswald", fontSize: 40, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

function FaceNames({ faces, label }: { faces: OgFace[]; label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: CARD, padding: "22px 24px" }}>
      <div style={{ color: MUTED, fontFamily: "Oswald", fontSize: 16, letterSpacing: 3, textTransform: "uppercase" }}>
        {label}
      </div>
      {faces.length ? (
        faces.slice(0, 4).map((face) => (
          <div key={face.name} style={{ color: INK, fontFamily: "Inter", fontWeight: 700, fontSize: 22, marginTop: 12 }}>
            {face.name}
          </div>
        ))
      ) : (
        <div style={{ color: MUTED, fontFamily: "Inter", fontSize: 20, marginTop: 14 }}>Nobody yet</div>
      )}
    </div>
  );
}

function TeamMarkup({ card }: { card: TeamOgCard }) {
  return (
    <Shell>
      <Wordmark right={`${card.sport} expert picks`} />
      <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
        <Chip chip={card.chip} size={88} />
        <div style={{ marginLeft: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 16, letterSpacing: 3, textTransform: "uppercase" }}>
            Team archive
          </div>
          <div style={{ color: INK, fontFamily: "Oswald", fontSize: headlineSize(`${card.name} expert picks`), lineHeight: 1.02 }}>
            {`${card.name} expert picks`}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 22 }}>
        <Stat label="With them" value={String(card.withThem)} />
        <Stat label="Against" value={String(card.against)} />
      </div>
      <div style={{ display: "flex", flex: 1, marginTop: 18, minHeight: 0 }}>
        <FaceNames faces={card.withFaces} label={`With ${card.name}`} />
        <div style={{ width: 2, background: "#2a2a2a" }} />
        <FaceNames faces={card.againstFaces} label="Against" />
      </div>
    </Shell>
  );
}

function WeekMarkup({ card }: { card: WeekOgCard }) {
  return (
    <Shell>
      <Wordmark right={card.kicker} />
      <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", marginTop: 20 }}>
        Weekly archive
      </div>
      <div style={{ color: INK, fontFamily: "Oswald", fontSize: 64, lineHeight: 1.02, marginTop: 4 }}>
        {card.title}
      </div>
      <div style={{ color: INK, fontFamily: "Oswald", fontSize: 36, marginTop: 16 }}>
        {card.line}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 22, flex: 1 }}>
        {card.games.slice(0, 5).map((game) => (
          <div key={game} style={{ color: MUTED, fontFamily: "Inter", fontSize: 24, marginTop: 10 }}>
            {game}
          </div>
        ))}
      </div>
    </Shell>
  );
}

function PunditMarkup({ card }: { card: PunditOgCard }) {
  const uri = photoUri(card.photo);
  const quote = card.latestQuote ? ogQuote(card.latestQuote, 130) : null;
  return (
    <Shell>
      <Wordmark right="Expert picks · Quotes · Receipts" />
      <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 24, minWidth: 0 }}>
        {uri ? (
          <img src={uri} width={330} height={330} style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ width: 330, height: 330, display: "flex", alignItems: "center", justifyContent: "center", background: CARD, color: MUTED, fontFamily: "Oswald", fontSize: 110 }}>
            {card.name.slice(0, 1)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, marginLeft: 38, overflow: "hidden" }}>
          <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 16, letterSpacing: 3, textTransform: "uppercase" }}>
            {card.outlet}
          </div>
          <div style={{ color: INK, fontFamily: "Oswald", fontSize: headlineSize(`${card.name} expert picks`), lineHeight: 1.02, marginTop: 6 }}>
            {`${card.name} expert picks`}
          </div>
          <div style={{ display: "flex", marginTop: 22 }}>
            <Stat label="Open picks" value={String(card.livePicks)} />
            <Stat label="2026 record" value={card.recordLabel} />
          </div>
          {quote ? (
            <div style={{ display: "flex", borderLeft: `4px solid ${GREEN}`, paddingLeft: 16, marginTop: 22, maxHeight: 76, overflow: "hidden", color: INK, fontFamily: "Inter", fontSize: 21, lineHeight: 1.3 }}>
              {`Latest: “${quote}”`}
            </div>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

export async function renderCardPng(
  tree: ReactNode,
  size: { width: number; height: number } = { width: W, height: H }
): Promise<Buffer> {
  const svg = await satori(tree, {
    width: size.width,
    height: size.height,
    fonts: [
      { name: "Oswald", data: oswald, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "IBM Plex Mono", data: plexMono, weight: 400, style: "normal" },
      { name: "IBM Plex Mono", data: plexMonoSemi, weight: 600, style: "normal" },
    ],
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size.width },
  });
  return Buffer.from(resvg.render().asPng());
}

export function takeTree(card: TakeOgCard) {
  return <TakeMarkup card={card} />;
}

export function eventTree(card: EventOgCard) {
  return <EventMarkup card={card} />;
}

export function punditTree(card: PunditOgCard) {
  return <PunditMarkup card={card} />;
}

export function teamTree(card: TeamOgCard) {
  return <TeamMarkup card={card} />;
}

export function weekTree(card: WeekOgCard) {
  return <WeekMarkup card={card} />;
}

function Legal({ text }: { text: string }) {
  return (
    <div style={{ color: "#6b6b6b", fontSize: 14, fontFamily: "Inter", marginTop: 14 }}>
      {text}
    </div>
  );
}

function storyQuote(claim: string, max = 90): string {
  const trimmed = claim.replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
  if (trimmed.length <= max) return trimmed;
  const window = trimmed.slice(0, max);
  const stop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf(", "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? ")
  );
  if (stop >= 24) return window.slice(0, stop).trim();
  return `${window.replace(/\s+\S*$/, "")}…`;
}

function StoryWordmark({ right }: { right?: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Oswald", fontSize: 42, letterSpacing: 6 }}>
        <span style={{ color: GREEN }}>PUNDITS</span>
        <span style={{ color: INK }}>.</span>
      </div>
      {right ? (
        <div style={{ color: MUTED, fontSize: 22, fontFamily: "Inter" }}>{right}</div>
      ) : null}
    </div>
  );
}

function StoryPrice({ side, accent }: { side: OgSide; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: side.picked ? "#101810" : CARD,
        padding: "22px 24px",
        borderLeft: side.picked ? `8px solid ${accent ?? GREEN}` : "8px solid #141414",
        marginTop: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {side.chip ? (
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: side.chip.primary,
              color: side.chip.ink,
              fontFamily: "Oswald",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {side.chip.abbr}
          </div>
        ) : null}
        <div style={{ marginLeft: side.chip ? 16 : 0, fontFamily: "Oswald", fontSize: 36, color: INK }}>
          {side.label}
        </div>
      </div>
      <div style={{ fontFamily: "Oswald", fontSize: 64, color: INK }}>{side.cents}</div>
    </div>
  );
}

function TakeStoryMarkup({ card }: { card: TakeOgCard }) {
  const uri = photoUri(card.photo);
  const quote = storyQuote(card.quote, 110);
  const verdictColor = card.status === "hit" ? GREEN : card.status === "miss" ? RED : GREEN;
  const rest = card.headline.startsWith(card.name)
    ? card.headline.slice(card.name.length).trim()
    : card.headline;
  const headline = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : card.headline;
  return (
    <div
      style={{
        width: STORY_W,
        height: STORY_H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
      }}
    >
      <div style={{ height: 12, width: "100%", background: GREEN }} />
      <div style={{ height: 820, width: "100%", display: "flex", position: "relative" }}>
        {uri ? (
          <img src={uri} width={1080} height={820} style={{ objectFit: "cover" }} />
        ) : (
          <div
            style={{
              width: 1080,
              height: 820,
              background: CARD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MUTED,
              fontFamily: "Oswald",
              fontSize: 180,
            }}
          >
            {card.name.slice(0, 1)}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0) 30%, rgba(10,10,10,0.2) 72%, #0a0a0a)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: 48,
            display: "flex",
          }}
        >
          <StoryWordmark right={card.when?.split(" · ")[0] ?? card.when} />
        </div>
        {card.status !== "pending" ? (
          <Stamp status={card.status} scale={1.6} top={150} right={64} />
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "36px 64px 0" }}>
        <div
          style={{
            color: MUTED,
            fontFamily: "Oswald",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {card.kicker}
        </div>
        <div
          style={{
            marginTop: 10,
            color: INK,
            fontFamily: "Oswald",
            fontSize: 64,
            lineHeight: 1.02,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 28,
            borderLeft: `6px solid ${verdictColor}`,
            paddingLeft: 22,
            color: INK,
            fontSize: 34,
            lineHeight: 1.28,
          }}
        >
          {`“${quote}”`}
        </div>
      </div>
      <div style={{ padding: "0 64px 20px", display: "flex", flexDirection: "column" }}>
        <StoryPrice side={card.sides[0]} accent={verdictColor} />
        <StoryPrice side={card.sides[1]} accent={verdictColor} />
      </div>
      {card.result ? (
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            letterSpacing: 4,
            color: INK,
            padding: "0 64px 14px",
          }}
        >
          {`FINAL: ${card.result.toUpperCase()}`}
        </div>
      ) : null}
      <div style={{ color: "#6b6b6b", fontSize: 22, padding: "0 64px 8px" }}>Not a bet they placed</div>
      <div
        style={{
          color: GREEN,
          fontFamily: "Oswald",
          fontSize: 22,
          letterSpacing: 3,
          padding: "0 64px 36px",
        }}
      >
        PUNDITS.PRO
      </div>
    </div>
  );
}

function StorySide({ side }: { side: OgSide }) {
  const face = side.faces[0];
  const uri = face ? photoUri(face.photo) : null;
  const quote = face?.quote ? storyQuote(face.quote, 110) : null;
  return (
    <div
      style={{
        background: CARD,
        padding: 28,
        borderLeft: "8px solid #141414",
        display: "flex",
        flexDirection: "column",
        marginTop: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {side.chip ? (
            <div
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: side.chip.primary,
                color: side.chip.ink,
                fontFamily: "Oswald",
                fontSize: 20,
              }}
            >
              {side.chip.abbr}
            </div>
          ) : null}
          <div style={{ marginLeft: side.chip ? 16 : 0, fontFamily: "Oswald", fontSize: 36, color: INK }}>
            {side.label}
          </div>
        </div>
        <div style={{ fontFamily: "Oswald", fontSize: 64, color: INK }}>{side.cents}</div>
      </div>
      {face ? (
        <div style={{ display: "flex", marginTop: 20, alignItems: "flex-start" }}>
          {uri ? <img src={uri} width={72} height={72} style={{ objectFit: "cover" }} /> : null}
          <div style={{ marginLeft: uri ? 14 : 0, display: "flex", flexDirection: "column" }}>
            <div style={{ color: INK, fontSize: 28, fontFamily: "Inter", fontWeight: 700 }}>{face.name}</div>
            {quote ? (
              <div style={{ color: MUTED, fontSize: 24, marginTop: 6, lineHeight: 1.3 }}>{`“${quote}”`}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EventStoryMarkup({ card }: { card: EventOgCard }) {
  return (
    <div
      style={{
        width: STORY_W,
        height: STORY_H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
      }}
    >
      <div style={{ height: 12, width: "100%", background: GREEN }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "100px 64px 0" }}>
        <StoryWordmark right={card.when} />
        <div
          style={{
            marginTop: 28,
            color: GREEN,
            fontFamily: "Oswald",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Expert pick split
        </div>
        <div style={{ marginTop: 10, color: INK, fontFamily: "Oswald", fontSize: 64, lineHeight: 1.02 }}>
          {card.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginTop: 20 }}>
          <StorySide side={card.sides[0]} />
          <StorySide side={card.sides[1]} />
        </div>
      </div>
      <div style={{ color: "#6b6b6b", fontSize: 22, padding: "16px 64px 8px" }}>Not bets they placed</div>
      <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 22, letterSpacing: 3, padding: "0 64px 36px" }}>
        PUNDITS.PRO
      </div>
    </div>
  );
}

function PunditStoryMarkup({ card }: { card: PunditOgCard }) {
  const uri = photoUri(card.photo);
  const quote = card.latestQuote ? ogQuote(card.latestQuote, 140) : null;
  return (
    <div
      style={{
        width: STORY_W,
        height: STORY_H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
      }}
    >
      <div style={{ height: 12, width: "100%", background: GREEN }} />
      <div style={{ height: 920, width: "100%", display: "flex", position: "relative" }}>
        {uri ? (
          <img src={uri} width={1080} height={920} style={{ objectFit: "cover" }} />
        ) : (
          <div
            style={{
              width: 1080,
              height: 920,
              background: CARD,
              color: MUTED,
              fontFamily: "Oswald",
              fontSize: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {card.name.slice(0, 1)}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: 48,
            display: "flex",
          }}
        >
          <StoryWordmark right="Quotes · Receipts" />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "36px 64px 0" }}>
        <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}>
          {card.outlet}
        </div>
        <div style={{ marginTop: 10, color: INK, fontFamily: "Oswald", fontSize: 72, lineHeight: 1 }}>
          {card.name}
        </div>
        <div style={{ display: "flex", marginTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", marginRight: 48 }}>
            <div style={{ color: MUTED, fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>Open picks</div>
            <div style={{ color: INK, fontFamily: "Oswald", fontSize: 72 }}>{String(card.livePicks)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: MUTED, fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>2026</div>
            <div style={{ color: INK, fontFamily: "Oswald", fontSize: 72 }}>{card.recordLabel}</div>
          </div>
        </div>
        {quote ? (
          <div
            style={{
              marginTop: 28,
              borderLeft: `6px solid ${GREEN}`,
              paddingLeft: 22,
              color: INK,
              fontSize: 34,
              lineHeight: 1.28,
            }}
          >
            {`“${quote}”`}
          </div>
        ) : null}
      </div>
      <div style={{ color: "#6b6b6b", fontSize: 22, padding: "0 64px 8px" }}>Mapped takes, not bets they placed</div>
      <div style={{ color: GREEN, fontFamily: "Oswald", fontSize: 22, letterSpacing: 3, padding: "0 64px 36px" }}>
        PUNDITS.PRO
      </div>
    </div>
  );
}

export function takeStoryTree(card: TakeOgCard) {
  return <TakeStoryMarkup card={card} />;
}

export function eventStoryTree(card: EventOgCard) {
  return <EventStoryMarkup card={card} />;
}

export function punditStoryTree(card: PunditOgCard) {
  return <PunditStoryMarkup card={card} />;
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
  const dirs = [
    "public/og/takes",
    "public/og/events",
    "public/og/pundits",
    "public/og/teams",
    "public/og/weeks",
    "public/og/stories/takes",
    "public/og/stories/events",
    "public/og/stories/pundits",
  ].map((dir) => path.join(ROOT, dir));
  const outs: string[] = [];
  for (const dir of dirs) outs.push(...(await dirFiles(dir)));
  const pngs = outs.filter((f) => f.endsWith(".png"));
  if (pngs.length !== expected) return false;
  const inputs = [
    path.join(ROOT, "data/calls.json"),
    path.join(ROOT, "data/events.json"),
    path.join(ROOT, "data/pundits.json"),
    path.join(ROOT, "data/teams.json"),
    path.join(ROOT, "lib/og.ts"),
    path.join(ROOT, "lib/social-card/model.ts"),
    path.join(ROOT, "lib/social-card/portraits.ts"),
    path.join(ROOT, "lib/social-card/resolver.ts"),
    path.join(ROOT, "scripts/social-card/assets.ts"),
    path.join(ROOT, "scripts/social-card/tokens.ts"),
    path.join(ROOT, "scripts/social-card/primitives.tsx"),
    path.join(ROOT, "scripts/social-card/split.tsx"),
    path.join(ROOT, "scripts/social-card/quote.tsx"),
    path.join(ROOT, "scripts/social-card/editorial.tsx"),
    path.join(ROOT, "scripts/social-card/render.tsx"),
    path.join(ROOT, "scripts/render-og.tsx"),
  ];
  const inMax = await newestMtime(inputs);
  const outMin = Math.min(...(await Promise.all(pngs.map(async (f) => (await stat(f)).mtimeMs))));
  return outMin > inMax;
}

export async function renderAllOg(force = false): Promise<{
  takes: number;
  events: number;
  pundits: number;
  teams: number;
  weeks: number;
}> {
  const calls = loadCalls();
  const events = loadEvents();
  const pundits = loadPundits();
  const teams = loadTeams();
  const takes = mappedTakes(calls, events, pundits);
  const weeks = archiveWeeks(events);
  const expected =
    (takes.length + events.length + pundits.length) * 2 + teams.length + weeks.length;
  if (!force && (await shouldSkip(expected))) {
    return {
      takes: takes.length,
      events: events.length,
      pundits: pundits.length,
      teams: teams.length,
      weeks: weeks.length,
    };
  }

  const storySize = { width: STORY_W, height: STORY_H };
  for (const dir of [
    "public/og/takes",
    "public/og/events",
    "public/og/pundits",
    "public/og/teams",
    "public/og/weeks",
    "public/og/stories/takes",
    "public/og/stories/events",
    "public/og/stories/pundits",
  ]) {
    const abs = path.join(ROOT, dir);
    await rm(abs, { recursive: true, force: true });
    await mkdir(abs, { recursive: true });
  }

  for (const take of takes) {
    const card = takeOgCard(take, calls, pundits, teams);
    const socialCard = resolveTakeSocialCard(take, calls, pundits, teams);
    try {
      await writePng(card.file, await renderCardPng(landscapeSocialTree(socialCard)));
      await writePng(ogStoryTakePath(take.event.slug, take.pundit.id), await renderCardPng(takeStoryTree(card), storySize));
    } catch (err) {
      throw new Error(`take ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const event of events) {
    const card = eventOgCard(event, calls, pundits, teams);
    const socialCard = resolveEventSocialCard(event, calls, pundits, teams);
    try {
      await writePng(card.file, await renderCardPng(landscapeSocialTree(socialCard)));
      await writePng(ogStoryEventPath(event.slug), await renderCardPng(eventStoryTree(card), storySize));
    } catch (err) {
      throw new Error(`event ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const pundit of pundits) {
    const record = toActivityRecord(pundit, calls);
    const card = punditOgCard(record, callsForPundit(pundit.id, calls)[0]);
    const socialCard = resolvePunditSocialCard(pundit, calls);
    try {
      await writePng(card.file, await renderCardPng(landscapeSocialTree(socialCard)));
    } catch (err) {
      throw new Error(`pundit landscape ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
    try {
      await writePng(ogStoryPunditPath(pundit.id), await renderCardPng(punditStoryTree(card), storySize));
    } catch (err) {
      throw new Error(`pundit story ${pundit.id}: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const team of teams) {
    const card = teamOgCard(team, events, calls, pundits);
    try {
      await writePng(card.file, await renderCardPng(teamTree(card)));
    } catch (err) {
      throw new Error(`team ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const week of weeks) {
    const card = weekOgCard(week.sport, week.season, week.week, events, calls);
    try {
      await writePng(card.file, await renderCardPng(weekTree(card)));
    } catch (err) {
      throw new Error(`week ${card.file}: ${err instanceof Error ? err.message : err}`);
    }
  }
  return {
    takes: takes.length,
    events: events.length,
    pundits: pundits.length,
    teams: teams.length,
    weeks: weeks.length,
  };
}

function isCli() {
  const invoked = process.argv[1]?.replaceAll("\\", "/") ?? "";
  return invoked.includes("scripts/render-og");
}

if (isCli()) {
  const force = process.argv.includes("--force");
  renderAllOg(force)
    .then((result) => {
      console.log(
        `OG cards: ${result.takes} takes, ${result.events} events, ${result.pundits} pundits, ${result.teams} teams, ${result.weeks} weeks`
      );
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
