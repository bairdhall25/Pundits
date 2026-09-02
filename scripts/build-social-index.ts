// scripts/build-social-index.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadCalls, loadEvents, loadPundits, loadTeams } from "../lib/data";
import { socialIndex } from "../lib/social";

async function main() {
  const dir = path.join(process.cwd(), "public", "social");
  await mkdir(dir, { recursive: true });
  const index = socialIndex(
    loadCalls(),
    loadEvents(),
    loadPundits(),
    undefined,
    loadTeams()
  );
  await writeFile(path.join(dir, "cards.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(
    `social index: ${index.events.length} events, ${index.takes.length} takes, ${index.pundits.length} pundits, ${index.teams.length} teams, ${index.weeks.length} weeks, ${index.pages.length} pages`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
