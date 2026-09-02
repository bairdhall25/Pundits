import type { ReactNode } from "react";
import type {
  PortraitFocus,
  SocialPerson,
  SocialTeamChip,
} from "../../lib/social-card";
import { socialPhotoUri } from "./assets";
import {
  SOCIAL_COLORS,
  SOCIAL_FONTS,
  SOCIAL_LAYOUT,
  SOCIAL_SIZE,
} from "./tokens";

export function SocialShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: SOCIAL_SIZE.width,
        height: SOCIAL_SIZE.height,
        position: "relative",
        display: "flex",
        overflow: "hidden",
        background: SOCIAL_COLORS.background,
        color: SOCIAL_COLORS.ink,
        fontFamily: SOCIAL_FONTS.body,
        borderTop: `${SOCIAL_LAYOUT.topRule}px solid ${SOCIAL_COLORS.green}`,
      }}
    >
      {children}
    </div>
  );
}

export function SocialHeader({ context }: { context?: string | null }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: SOCIAL_LAYOUT.headerHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          color: SOCIAL_COLORS.green,
          fontFamily: SOCIAL_FONTS.display,
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 4,
        }}
      >
        PUNDITS<span style={{ color: SOCIAL_COLORS.ink }}>.</span>
      </div>
      {context ? (
        <div
          style={{
            display: "flex",
            maxWidth: 720,
            marginLeft: 24,
            color: SOCIAL_COLORS.muted,
            fontFamily: SOCIAL_FONTS.mono,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: 1.1,
            textAlign: "right",
            textTransform: "uppercase",
          }}
        >
          {context}
        </div>
      ) : null}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        color: SOCIAL_COLORS.green,
        fontFamily: SOCIAL_FONTS.display,
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 3.2,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function TeamChip({
  chip,
  size = 62,
}: {
  chip: SocialTeamChip;
  size?: number;
}) {
  const fontSize = chip.abbr.length > 3 ? Math.round(size * 0.26) : Math.round(size * 0.31);
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: chip.primary,
        color: chip.ink,
        fontFamily: SOCIAL_FONTS.display,
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {chip.abbr}
    </div>
  );
}

function objectPosition(focus: PortraitFocus | undefined): string {
  if (!focus) return "50% 28%";
  return `${Math.round(focus.x * 100)}% ${Math.round(focus.y * 100)}%`;
}

export function PersonPortrait({
  person,
  width,
  height,
  circular = false,
}: {
  person: SocialPerson;
  width: number | string;
  height: number | string;
  circular?: boolean;
}) {
  const uri = socialPhotoUri(person.portrait);
  if (!uri) return null;
  return (
    <img
      alt={person.name}
      src={uri}
      width={width}
      height={height}
      style={{
        display: "flex",
        width,
        height,
        flexShrink: 0,
        objectFit: "cover",
        objectPosition: objectPosition(person.portraitFocus),
        ...(circular
          ? {
              border: `2px solid ${SOCIAL_COLORS.green}`,
              borderRadius: "50%",
            }
          : {}),
      }}
    />
  );
}

export function ProofRail({
  items,
  disclosure,
}: {
  items: string[];
  disclosure: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SOCIAL_LAYOUT.proofHeight,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        overflow: "hidden",
        background: SOCIAL_COLORS.proof,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flexShrink: 1, minWidth: 0 }}>
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{
              display: "flex",
              marginRight: index === items.length - 1 ? 0 : 23,
              color: index === 1 ? SOCIAL_COLORS.green : SOCIAL_COLORS.ink,
              fontFamily: SOCIAL_FONTS.display,
              fontSize: items.length > 2 ? 20 : 25,
              fontWeight: 700,
              lineHeight: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginLeft: "auto",
          paddingLeft: 24,
          flexShrink: 0,
          color: SOCIAL_COLORS.muted,
          fontFamily: SOCIAL_FONTS.mono,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {disclosure}
      </div>
    </div>
  );
}

export function ResultStamp({ state }: { state: "hit" | "miss" }) {
  const color = state === "hit" ? SOCIAL_COLORS.green : SOCIAL_COLORS.red;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 13px 7px",
        border: `4px solid ${color}`,
        color,
        fontFamily: SOCIAL_FONTS.display,
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 4,
        textTransform: "uppercase",
        transform: "rotate(-4deg)",
      }}
    >
      {state}
    </div>
  );
}
