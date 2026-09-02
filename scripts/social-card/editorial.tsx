import type {
  EditorialSocialCardModel,
  SocialMetric,
  SocialPerson,
  SocialSide,
} from "../../lib/social-card";
import {
  Kicker,
  PersonPortrait,
  ProofRail,
  SocialHeader,
  SocialShell,
  TeamChip,
} from "./primitives";
import { SOCIAL_COLORS, SOCIAL_FONTS, SOCIAL_LAYOUT } from "./tokens";

function centsLabel(cents: number | null): string {
  return cents == null ? "—" : `${cents}¢ frozen`;
}

function metricColor(metric: SocialMetric): string {
  if (metric.tone === "accent") return SOCIAL_COLORS.green;
  if (metric.tone === "muted") return SOCIAL_COLORS.muted;
  return SOCIAL_COLORS.ink;
}

function CirclePerson({ person, compact = false }: { person: SocialPerson; compact?: boolean }) {
  const size = compact ? 108 : 122;
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minWidth: 0,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: compact ? "12px 8px 9px" : "15px 10px 12px",
        borderRight: `1px solid ${SOCIAL_COLORS.line}`,
        background: SOCIAL_COLORS.panel,
      }}
    >
      {person.portrait ? (
        <PersonPortrait person={person} width={size} height={size} circular />
      ) : null}
      <div
        style={{
          display: "flex",
          marginTop: person.portrait ? 9 : 0,
          color: SOCIAL_COLORS.ink,
          fontFamily: SOCIAL_FONTS.body,
          fontSize: compact ? 15 : 17,
          fontWeight: 700,
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        {person.name}
      </div>
    </div>
  );
}

function teamSupportingPeople(model: EditorialSocialCardModel): SocialPerson[] {
  const featuredId = model.feature?.person?.punditId;
  const seen = new Set<string>();
  const people: SocialPerson[] = [];
  for (const group of model.groups) {
    for (const person of group.people.people) {
      if (person.punditId === featuredId || seen.has(person.punditId)) continue;
      seen.add(person.punditId);
      people.push(person);
      if (people.length === 4) return people;
    }
  }
  return people;
}

function TeamCard({ model }: { model: EditorialSocialCardModel }) {
  const supporting = teamSupportingPeople(model);
  const feature = model.feature;
  return (
    <SocialShell>
      <SocialHeader context={model.kicker} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: SOCIAL_LAYOUT.headerHeight,
          bottom: SOCIAL_LAYOUT.proofHeight,
          width: 455,
          display: "flex",
          flexDirection: "column",
          padding: "28px 28px 22px 32px",
          background: SOCIAL_COLORS.panelDark,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          {model.chip ? <TeamChip chip={model.chip} size={76} /> : null}
          <div
            style={{
              display: "flex",
              marginLeft: model.chip ? 16 : 0,
              color: SOCIAL_COLORS.ink,
              fontFamily: SOCIAL_FONTS.display,
              fontSize: model.headline.length > 14 ? 54 : 72,
              fontWeight: 700,
              lineHeight: 0.9,
              textTransform: "uppercase",
            }}
          >
            {model.headline}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", marginTop: 20, borderTop: `1px solid ${SOCIAL_COLORS.line}`, borderBottom: `1px solid ${SOCIAL_COLORS.line}` }}>
          {model.metrics.slice(0, 2).map((metric, index) => (
            <div key={metric.label} style={{ display: "flex", flex: 1, alignItems: "center", minHeight: 0, borderBottom: index === 0 ? `1px solid ${SOCIAL_COLORS.line}` : "none" }}>
              <div style={{ display: "flex", width: 112, justifyContent: "flex-end", color: metricColor(metric), fontFamily: SOCIAL_FONTS.display, fontSize: 116, fontWeight: 700, lineHeight: 0.82 }}>
                {metric.value}
              </div>
              <div style={{ display: "flex", marginLeft: 18, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 42, fontWeight: 700, lineHeight: 0.95, textTransform: "uppercase" }}>
                {metric.label}.
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 455, right: 0, top: SOCIAL_LAYOUT.headerHeight, bottom: SOCIAL_LAYOUT.proofHeight, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {feature?.person ? (
          <div style={{ height: 250, display: "flex", flexShrink: 0, overflow: "hidden", borderTop: `6px solid ${model.chip?.primary ?? SOCIAL_COLORS.green}` }}>
            <div style={{ width: 255, height: "100%", display: "flex", flexShrink: 0, overflow: "hidden", borderRight: `${SOCIAL_LAYOUT.heroRule}px solid ${SOCIAL_COLORS.green}` }}>
              <PersonPortrait person={feature.person} width="100%" height="100%" />
            </div>
            <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", justifyContent: "center", padding: "20px 28px", background: SOCIAL_COLORS.panel }}>
              <div style={{ display: "flex", color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.body, fontSize: 27, fontWeight: 700, lineHeight: 1.08 }}>{feature.kicker}</div>
              <div style={{ display: "flex", marginTop: 10, color: SOCIAL_COLORS.green, fontFamily: SOCIAL_FONTS.display, fontSize: 23, fontWeight: 700, lineHeight: 1.05, textTransform: "uppercase" }}>{feature.headline}</div>
              {feature.context ? <div style={{ display: "flex", marginTop: 9, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 12, fontWeight: 600, lineHeight: 1, letterSpacing: 0.5, textTransform: "uppercase" }}>{feature.context}</div> : null}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "36px", borderTop: `6px solid ${SOCIAL_COLORS.green}`, background: SOCIAL_COLORS.panel, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.display, fontSize: 42, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>
            No verified pick yet. The archive stays honest until a public call clears the bar.
          </div>
        )}
        {supporting.length ? (
          <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", borderTop: `6px solid ${SOCIAL_COLORS.line}` }}>
            {supporting.map((person) => <CirclePerson key={person.punditId} person={person} />)}
          </div>
        ) : null}
      </div>
      <ProofRail items={model.proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

function WeekMetric({ metric }: { metric: SocialMetric }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", marginTop: 12 }}>
      <div style={{ display: "flex", color: metricColor(metric), fontFamily: SOCIAL_FONTS.display, fontSize: 86, fontWeight: 700, lineHeight: 0.82 }}>{metric.value}</div>
      <div style={{ display: "flex", marginLeft: 14, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 31, fontWeight: 700, lineHeight: 1, textTransform: "uppercase" }}>{metric.label}</div>
    </div>
  );
}

function SplitSummary({ side, accent }: { side: SocialSide; accent: string }) {
  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, minHeight: 112, alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderTop: `5px solid ${accent}`, background: SOCIAL_COLORS.background }}>
      <div style={{ display: "flex", minWidth: 0, flexDirection: "column" }}>
        <div style={{ display: "flex", color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 23, fontWeight: 700, lineHeight: 1, textTransform: "uppercase" }}>{side.label}</div>
        <div style={{ display: "flex", marginTop: 8, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 12, fontWeight: 600, lineHeight: 1, letterSpacing: 0.5, textTransform: "uppercase" }}>{centsLabel(side.cents)}</div>
      </div>
      <div style={{ display: "flex", marginLeft: 14, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 69, fontWeight: 700, lineHeight: 0.82 }}>{side.people.total}</div>
    </div>
  );
}

function WeekCard({ model }: { model: EditorialSocialCardModel }) {
  const people = model.people?.people ?? [];
  const sides = model.feature?.sides;
  return (
    <SocialShell>
      <SocialHeader context={model.context} />
      <div style={{ position: "absolute", left: 0, top: SOCIAL_LAYOUT.headerHeight, bottom: SOCIAL_LAYOUT.proofHeight, width: 455, display: "flex", flexDirection: "column", padding: "28px 28px 20px 32px", background: SOCIAL_COLORS.panelDark }}>
        <Kicker>{model.kicker}</Kicker>
        <div style={{ display: "flex", marginTop: 10, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 76, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>{model.headline}</div>
        <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", justifyContent: "center", marginTop: 10, borderTop: `1px solid ${SOCIAL_COLORS.line}` }}>
          {model.metrics.slice(0, 3).map((metric) => <WeekMetric key={metric.label} metric={metric} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 455, right: 0, top: SOCIAL_LAYOUT.headerHeight, bottom: SOCIAL_LAYOUT.proofHeight, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", padding: "20px 28px", borderTop: `6px solid ${SOCIAL_COLORS.green}`, background: SOCIAL_COLORS.panel }}>
          <Kicker>{model.feature?.kicker ?? "Weekly archive"}</Kicker>
          <div style={{ display: "flex", marginTop: 7, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: model.feature?.headline && model.feature.headline.length > 28 ? 48 : 58, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>{model.feature?.headline ?? "Results land as games grade"}</div>
          {sides ? (
            <div style={{ display: "flex", flex: 1, alignItems: "flex-end", marginTop: 16 }}>
              <SplitSummary side={sides[0]} accent={sides[0].chip?.primary ?? SOCIAL_COLORS.green} />
              <div style={{ width: 10, display: "flex" }} />
              <SplitSummary side={sides[1]} accent={sides[1].chip?.primary ?? SOCIAL_COLORS.line} />
            </div>
          ) : null}
        </div>
        {people.length ? (
          <div style={{ height: 184, display: "flex", flexShrink: 0, overflow: "hidden", borderTop: `6px solid ${SOCIAL_COLORS.line}` }}>
            {people.map((person) => <CirclePerson key={person.punditId} person={person} compact />)}
          </div>
        ) : null}
      </div>
      <ProofRail items={model.proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

function PagePersonRow({ person }: { person: SocialPerson }) {
  const quote = person.quote && person.quote.length > 92
    ? `${person.quote.slice(0, 89).replace(/\s+\S*$/, "")}…`
    : person.quote;
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "center", padding: "14px 22px", borderBottom: `1px solid ${SOCIAL_COLORS.line}`, background: SOCIAL_COLORS.panel }}>
      {person.portrait ? <PersonPortrait person={person} width={118} height={118} circular /> : null}
      <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", marginLeft: person.portrait ? 20 : 0 }}>
        <div style={{ display: "flex", color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 28, fontWeight: 700, lineHeight: 1, textTransform: "uppercase" }}>{person.name}</div>
        <div style={{ display: "flex", marginTop: 8, color: quote ? SOCIAL_COLORS.muted : SOCIAL_COLORS.green, fontFamily: quote ? SOCIAL_FONTS.body : SOCIAL_FONTS.mono, fontSize: quote ? 16 : 12, fontWeight: quote ? 400 : 600, lineHeight: quote ? 1.2 : 1, letterSpacing: quote ? 0 : 0.6, textTransform: quote ? "none" : "uppercase" }}>
          {quote ? `“${quote}”` : person.outlet}
        </div>
      </div>
    </div>
  );
}

function PageProofRows({ model }: { model: EditorialSocialCardModel }) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column" }}>
      {model.proof.slice(0, 3).map((item, index) => (
        <div key={item} style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "center", padding: "20px 30px", borderBottom: `1px solid ${SOCIAL_COLORS.line}`, background: index === 0 ? SOCIAL_COLORS.panel : SOCIAL_COLORS.panelDark }}>
          <div style={{ display: "flex", width: 8, height: "72%", flexShrink: 0, marginRight: 22, background: index === 0 ? SOCIAL_COLORS.green : SOCIAL_COLORS.line }} />
          <div style={{ display: "flex", color: index === 0 ? SOCIAL_COLORS.ink : SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.display, fontSize: 37, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function PageCard({ model }: { model: EditorialSocialCardModel }) {
  const people = model.people?.people ?? [];
  return (
    <SocialShell>
      <SocialHeader context={model.context} />
      <div style={{ position: "absolute", left: 0, top: SOCIAL_LAYOUT.headerHeight, bottom: SOCIAL_LAYOUT.proofHeight, width: 500, display: "flex", flexDirection: "column", padding: "25px 30px 20px 32px", background: SOCIAL_COLORS.panelDark }}>
        <Kicker>{model.kicker}</Kicker>
        <div style={{ display: "flex", marginTop: 8, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: model.headline.length > 42 ? 60 : 76, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>{model.headline}</div>
        {model.metrics.length ? (
          <div style={{ display: "flex", marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${SOCIAL_COLORS.line}` }}>
            {model.metrics.slice(0, 2).map((metric) => (
              <div key={metric.label} style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column" }}>
                <div style={{ display: "flex", color: metricColor(metric), fontFamily: SOCIAL_FONTS.display, fontSize: 70, fontWeight: 700, lineHeight: 0.84 }}>{metric.value}</div>
                <div style={{ display: "flex", marginTop: 8, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 12, fontWeight: 600, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase" }}>{metric.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: 500, right: 0, top: SOCIAL_LAYOUT.headerHeight, bottom: SOCIAL_LAYOUT.proofHeight, display: "flex", flexDirection: "column", overflow: "hidden", borderTop: `6px solid ${SOCIAL_COLORS.green}` }}>
        {people.length ? people.map((person) => <PagePersonRow key={person.punditId} person={person} />) : <PageProofRows model={model} />}
      </div>
      <ProofRail items={model.proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

export function EmptyEventCard({ model }: { model: EditorialSocialCardModel }) {
  return (
    <SocialShell>
      <SocialHeader context={model.context} />
      <div style={{ position: "absolute", top: 80, left: 36, right: 36, bottom: SOCIAL_LAYOUT.proofHeight + 22, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Kicker>{model.kicker}</Kicker>
        <div style={{ display: "flex", marginTop: 12, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: model.headline.length > 50 ? 58 : 76, fontWeight: 700, lineHeight: 1.02, textTransform: "uppercase" }}>
          {model.headline}
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "stretch", marginTop: 24 }}>
          {model.metrics.map((metric, index) => (
            <div key={metric.label} style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "24px 30px", marginRight: index === model.metrics.length - 1 ? 0 : 12, borderTop: `7px solid ${index === 0 ? SOCIAL_COLORS.green : SOCIAL_COLORS.faint}`, background: SOCIAL_COLORS.panel }}>
              <div style={{ display: "flex", color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 15, fontWeight: 600, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>{metric.label}</div>
              <div style={{ display: "flex", marginTop: 13, color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 78, fontWeight: 700, lineHeight: 0.9 }}>{metric.value}</div>
              <div style={{ display: "flex", marginTop: 16, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.display, fontSize: 24, fontWeight: 700, lineHeight: 1, textTransform: "uppercase" }}>No verified pick yet</div>
            </div>
          ))}
        </div>
      </div>
      <ProofRail items={model.proof} disclosure={model.disclosure} />
    </SocialShell>
  );
}

export function EditorialCard({ model }: { model: EditorialSocialCardModel }) {
  if (model.mode === "event-empty") return <EmptyEventCard model={model} />;
  if (model.mode === "team") return <TeamCard model={model} />;
  if (model.mode === "week") return <WeekCard model={model} />;
  return <PageCard model={model} />;
}
