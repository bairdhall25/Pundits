import type {
  SocialPeopleGroup,
  SocialPerson,
  SocialSide,
  SplitSocialCardModel,
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
  return cents == null ? "—" : `${cents}¢`;
}

function displayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const midpoint = Math.ceil(parts.length / 2);
  return `${parts.slice(0, midpoint).join(" ")}\n${parts.slice(midpoint).join(" ")}`;
}

function FeaturedPerson({ person }: { person: SocialPerson }) {
  const hasPhoto = Boolean(person.portrait);
  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, overflow: "hidden", background: SOCIAL_COLORS.panel }}>
      {hasPhoto ? <PersonPortrait person={person} width="58%" height="100%" /> : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
          justifyContent: "center",
          padding: hasPhoto ? "18px 17px" : "24px 28px",
          borderLeft: `1px solid ${SOCIAL_COLORS.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "pre-line",
            color: SOCIAL_COLORS.ink,
            fontFamily: SOCIAL_FONTS.display,
            fontSize: 35,
            fontWeight: 700,
            lineHeight: 0.94,
            textTransform: "uppercase",
          }}
        >
          {displayName(person.name)}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 13,
            color: SOCIAL_COLORS.green,
            fontFamily: SOCIAL_FONTS.display,
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.05,
            textTransform: "uppercase",
          }}
        >
          {person.quote ? "The lone call" : person.outlet}
        </div>
      </div>
    </div>
  );
}

function PersonTile({
  person,
  width = "50%",
  height = "50%",
}: {
  person: SocialPerson;
  width?: string;
  height?: string;
}) {
  const hasPhoto = Boolean(person.portrait);
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        minWidth: 0,
        overflow: "hidden",
        borderRight: `1px solid ${SOCIAL_COLORS.line}`,
        borderBottom: `1px solid ${SOCIAL_COLORS.line}`,
        background: SOCIAL_COLORS.panel,
      }}
    >
      {hasPhoto ? (
        <div style={{ display: "flex", marginLeft: 14, flexShrink: 0 }}>
          <PersonPortrait person={person} width={126} height={126} circular />
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
          justifyContent: "center",
          padding: hasPhoto ? "10px 12px" : "12px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: SOCIAL_COLORS.ink,
            fontFamily: SOCIAL_FONTS.body,
            fontSize: 19,
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          {person.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 7,
            color: SOCIAL_COLORS.muted,
            fontFamily: SOCIAL_FONTS.mono,
            fontSize: 10,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {person.outlet}
        </div>
      </div>
    </div>
  );
}

function EmptySide({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        background: SOCIAL_COLORS.panelDark,
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 330,
          color: SOCIAL_COLORS.muted,
          fontFamily: SOCIAL_FONTS.display,
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.02,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {`No verified ${label} pick yet`}
      </div>
    </div>
  );
}

function PeopleGrid({ group, label }: { group: SocialPeopleGroup; label: string }) {
  if (group.people.length === 0) return <EmptySide label={label} />;
  if (group.people.length === 1) return <FeaturedPerson person={group.people[0]} />;
  const count = group.people.length;
  return (
    <div style={{ display: "flex", flex: 1, flexWrap: "wrap", minWidth: 0, overflow: "hidden" }}>
      {group.people.map((person, index) => {
        if (count === 2) {
          return <PersonTile key={person.punditId} person={person} width="100%" height="50%" />;
        }
        if (count === 3 && index === 2) {
          return <PersonTile key={person.punditId} person={person} width="100%" height="50%" />;
        }
        return <PersonTile key={person.punditId} person={person} />;
      })}
      {group.overflow > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 10,
            display: "flex",
            padding: "5px 9px",
            background: SOCIAL_COLORS.green,
            color: "#071007",
            fontFamily: SOCIAL_FONTS.display,
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {`+${group.overflow}`}
        </div>
      ) : null}
    </div>
  );
}

function SideHeader({ side }: { side: SocialSide }) {
  return (
    <div
      style={{
        height: 78,
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderTop: `6px solid ${side.chip?.primary ?? SOCIAL_COLORS.green}`,
        borderBottom: `1px solid ${SOCIAL_COLORS.line}`,
        background: SOCIAL_COLORS.background,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        {side.chip ? <TeamChip chip={side.chip} size={56} /> : null}
        <div
          style={{
            display: "flex",
            marginLeft: side.chip ? 13 : 0,
            color: SOCIAL_COLORS.ink,
            fontFamily: SOCIAL_FONTS.display,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {side.label}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: 12 }}>
        <div style={{ display: "flex", color: SOCIAL_COLORS.ink, fontFamily: SOCIAL_FONTS.display, fontSize: 55, fontWeight: 700, lineHeight: 0.8 }}>
          {side.people.total}
        </div>
        <div style={{ display: "flex", marginTop: 5, color: SOCIAL_COLORS.muted, fontFamily: SOCIAL_FONTS.mono, fontSize: 11, fontWeight: 600, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>
          {side.people.total === 1 ? "pick" : "picks"}
        </div>
      </div>
    </div>
  );
}

function sideWidths(model: SplitSocialCardModel): [string, string] {
  const [left, right] = model.sides.map((side) => side.people.total);
  if (left === 1 && right >= 3) return ["42%", "58%"];
  if (right === 1 && left >= 3) return ["58%", "42%"];
  return ["50%", "50%"];
}

function headlineSize(headline: string): number {
  if (headline.length > 52) return 44;
  if (headline.length > 32) return 48;
  return 68;
}

export function SplitCard({ model }: { model: SplitSocialCardModel }) {
  const widths = sideWidths(model);
  const proof = [
    `${model.sides[0].label} ${centsLabel(model.sides[0].cents)}`,
    `${model.sides[1].label} ${centsLabel(model.sides[1].cents)}`,
  ];
  return (
    <SocialShell>
      <SocialHeader context={model.context} />
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 32,
          right: 32,
          height: 102,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            color: SOCIAL_COLORS.ink,
            fontFamily: SOCIAL_FONTS.display,
            fontSize: headlineSize(model.headline),
            fontWeight: 700,
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          {model.headline}
        </div>
        <div style={{ display: "flex", flexShrink: 0, marginLeft: 24, paddingBottom: 9 }}>
          <Kicker>{model.kicker}</Kicker>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 166,
          left: 0,
          right: 0,
          bottom: SOCIAL_LAYOUT.proofHeight,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {model.sides.map((side, index) => (
          <div
            key={side.side}
            style={{
              position: "relative",
              width: widths[index],
              display: "flex",
              minWidth: 0,
              flexDirection: "column",
              overflow: "hidden",
              borderRight: index === 0 ? `2px solid ${SOCIAL_COLORS.background}` : "none",
            }}
          >
            <SideHeader side={side} />
            <PeopleGrid group={side.people} label={side.label} />
          </div>
        ))}
      </div>
      <ProofRail items={proof} disclosure="Frozen market snapshot · not a bet" />
    </SocialShell>
  );
}
