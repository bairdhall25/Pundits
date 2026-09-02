import type { EditorialSocialCardModel } from "../../lib/social-card";
import { Kicker, ProofRail, SocialHeader, SocialShell } from "./primitives";
import { SOCIAL_COLORS, SOCIAL_FONTS, SOCIAL_LAYOUT } from "./tokens";

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
