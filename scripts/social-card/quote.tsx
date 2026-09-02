import type { QuoteSocialCardModel, SocialMetric } from "../../lib/social-card";
import {
  Kicker,
  PersonPortrait,
  ProofRail,
  ResultStamp,
  SocialHeader,
  SocialShell,
  TeamChip,
} from "./primitives";
import { SOCIAL_COLORS, SOCIAL_FONTS, SOCIAL_LAYOUT } from "./tokens";

function dominantQuoteSize(quote: string): number {
  if (quote.length > 140) return 43;
  if (quote.length > 105) return 49;
  if (quote.length > 72) return 56;
  return 65;
}

function metricValue(model: QuoteSocialCardModel, label: string): string | null {
  return model.metrics.find((metric) => metric.label === label)?.value ?? null;
}

function PickSignature({ model }: { model: QuoteSocialCardModel }) {
  const picked = model.sides?.find((side) => side.picked);
  return (
    <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
      {picked?.chip ? <TeamChip chip={picked.chip} size={58} /> : null}
      <div style={{ display: "flex", flexDirection: "column", marginLeft: picked?.chip ? 13 : 0, minWidth: 0 }}>
        <div style={{ display: "flex", color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.body, fontSize: 23, fontWeight: 700, lineHeight: 1.05 }}>
          {model.subject.name}
        </div>
        <div style={{ display: "flex", marginTop: 7, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 11, fontWeight: 600, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase" }}>
          {model.subject.outlet}
        </div>
      </div>
    </div>
  );
}

function Metric({ metric }: { metric: SocialMetric }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginRight: 46 }}>
      <div style={{ display: "flex", color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 13, fontWeight: 600, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>
        {metric.label}
      </div>
      <div style={{ display: "flex", marginTop: 5, color: metric.tone === "accent" ? SOCIAL_COLORS.green : SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 54, fontWeight: 700, lineHeight: 0.92 }}>
        {metric.value}
      </div>
    </div>
  );
}

function TakeCard({ model }: { model: QuoteSocialCardModel }) {
  const quote = model.quoteExcerpt ?? model.headline;
  const hasPhoto = Boolean(model.subject.portrait);
  const picked = metricValue(model, "Picked");
  const frozen = metricValue(model, "Frozen");
  const proof = [
    ...(picked ? [picked] : []),
    ...(frozen ? [`${frozen} frozen`] : []),
    model.state === "pending" ? "Open pick" : model.state,
  ];
  return (
    <SocialShell>
      {hasPhoto ? (
        <div style={{ position: "absolute", top: 0, left: 0, bottom: SOCIAL_LAYOUT.proofHeight, width: "45.5%", display: "flex", overflow: "hidden", borderRight: `7px solid ${SOCIAL_COLORS.green}` }}>
          <PersonPortrait person={model.subject} width="100%" height="100%" />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 95, display: "flex", background: "linear-gradient(180deg, rgba(8,9,8,0), rgba(8,9,8,0.78))" }} />
        </div>
      ) : null}
      <SocialHeader context={model.context} />
      <div
        style={{
          position: "absolute",
          top: 72,
          left: hasPhoto ? "45.5%" : 0,
          right: 0,
          bottom: SOCIAL_LAYOUT.proofHeight,
          display: "flex",
          flexDirection: "column",
          padding: "15px 34px 24px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Kicker>{model.result ? `${model.result.label} receipt` : "Public prediction"}</Kicker>
          {model.state === "hit" || model.state === "miss" ? <ResultStamp state={model.state} /> : null}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            minHeight: 0,
            padding: "12px 0 8px",
            color: SOCIAL_COLORS.ink,
            fontFamily: SOCIAL_FONTS.display,
            fontSize: dominantQuoteSize(quote),
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -0.5,
            textTransform: "uppercase",
          }}
        >
          {`“${quote}”`}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 66 }}>
          <PickSignature model={model} />
          {model.result?.detail ? (
            <div style={{ display: "flex", marginLeft: 20, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 13, fontWeight: 600, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase" }}>
              {model.result.detail}
            </div>
          ) : null}
        </div>
      </div>
      <ProofRail items={proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

function punditNameLines(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return name;
  const midpoint = Math.ceil(words.length / 2);
  return `${words.slice(0, midpoint).join(" ")}\n${words.slice(midpoint).join(" ")}`;
}

function PunditCard({ model }: { model: QuoteSocialCardModel }) {
  const hasPhoto = Boolean(model.subject.portrait);
  const proof = model.proof.length ? model.proof : ["The ledger"];
  return (
    <SocialShell>
      {hasPhoto ? (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: SOCIAL_LAYOUT.proofHeight, width: "44%", display: "flex", overflow: "hidden", borderRight: `7px solid ${SOCIAL_COLORS.green}` }}>
          <PersonPortrait person={model.subject} width="100%" height="100%" />
        </div>
      ) : null}
      <SocialHeader context={model.context} />
      <div
        style={{
          position: "absolute",
          left: hasPhoto ? "44%" : 0,
          right: 0,
          top: 72,
          bottom: SOCIAL_LAYOUT.proofHeight,
          display: "flex",
          flexDirection: "column",
          padding: hasPhoto ? "22px 32px 18px 34px" : "22px 52px 18px",
          overflow: "hidden",
        }}
      >
        <Kicker>{model.kicker}</Kicker>
        <div style={{ display: "flex", whiteSpace: "pre-line", marginTop: 7, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: model.headline.length > 22 ? 65 : 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -0.6, textTransform: "uppercase" }}>
          {punditNameLines(model.headline)}
        </div>
        <div style={{ display: "flex", marginTop: 16 }}>
          {model.metrics.slice(0, 2).map((metric) => <Metric key={metric.label} metric={metric} />)}
        </div>
        {model.quoteExcerpt ? (
          <div style={{ display: "flex", flex: 1, minHeight: 118, flexDirection: "column", justifyContent: "center", marginTop: 16, padding: "14px 18px", overflow: "hidden", borderLeft: `6px solid ${SOCIAL_COLORS.green}`, background: SOCIAL_COLORS.panel }}>
            <div style={{ display: "flex", color: SOCIAL_COLORS.green, fontFamily: SOCIAL_FONTS.mono, fontSize: 12, fontWeight: 600, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>
              Latest mapped take
            </div>
            <div style={{ display: "flex", marginTop: 8, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: model.quoteExcerpt.length > 105 ? 22 : 27, fontWeight: 700, lineHeight: 1.12, textTransform: "uppercase" }}>
              {`“${model.quoteExcerpt}”`}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 16, padding: "18px", borderLeft: `6px solid ${SOCIAL_COLORS.green}`, background: SOCIAL_COLORS.panel, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.display, fontSize: 28, fontWeight: 700, lineHeight: 1.08, textTransform: "uppercase" }}>
            Profile and public prediction archive
          </div>
        )}
      </div>
      <ProofRail items={proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

export function QuoteCard({ model }: { model: QuoteSocialCardModel }) {
  return model.mode === "pundit" ? <PunditCard model={model} /> : <TakeCard model={model} />;
}
