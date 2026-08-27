import type { Team } from "@/lib/types";

export function TeamChip({
  team,
  size = "card",
}: {
  team: Team;
  size?: "card" | "inline";
}) {
  return (
    <span
      className={`team-chip ${size} ${team.abbr.length > 3 ? "long" : ""}`}
      style={{ background: team.primary, color: team.ink }}
      aria-hidden="true"
    >
      {team.abbr}
    </span>
  );
}
