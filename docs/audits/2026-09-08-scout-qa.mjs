// Read-only PM acceptance probes for Scout PR #25 at 773e708.
// Run from repository root: node docs/audits/2026-09-08-scout-qa.mjs
import { readFileSync } from 'node:fs';
import { scoreSlate } from '../../scripts/scout-density-lib.mjs';
import { loadCaptureTargets } from '../../scripts/scout-targets-lib.mjs';
import { rowIdentity, approvalStillValid, promoteReadyRows } from '../../scripts/scout-handoff-lib.mjs';
import { classifyItem } from '../../scripts/scout-feeds-lib.mjs';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const events = read('data/events.json').events;
const calls = read('data/calls.json');
const targets = loadCaptureTargets(read('docs/capture-targets.json'));
const now = new Date('2026-09-08T23:30:00-04:00');
for (const t of targets.targets) if (t.sport === 'ncaaf') t.state = 'approved';
const rows = scoreSlate({ events, calls, targets, now: +now });
console.log('Approved college targets:', targets.targets.filter(t => t.sport === 'ncaaf').length);
console.log('College Dispatch rows:', rows.filter(r => r.sport === 'ncaaf').length);
const original = { pundit: 'fixture', eventSlug: 'fixture-2026', side: 'yes', verbatimQuote: 'I pick the away team.', sourceUrl: 'https://example.org/evidence', sourceDate: '2026-09-08', reasoning: 'Their defense is stronger.' };
const audit = { ...original, rowId: rowIdentity(original), verdict: 'ok' };
for (const [field, value] of [['reasoning', 'Unsupported replacement rationale.'], ['sourceDate', '2025-09-08']]) {
  const changed = { ...original, [field]: value };
  console.log(`${field} changed: approval valid=${approvalStillValid(audit, changed)}, ready=${promoteReadyRows([audit], [changed]).ready.length}`);
}
const item = { title: 'Week 1 picks', url: 'https://podcasts.apple.com/us/podcast/id1171438277?i=1000788488079', published: '2026-09-08T15:11:00Z' };
const ledger = read('docs/scout-episodes.json');
ledger.episodes[0].reopenReason = 'Another designated speaker or newly approved target remains uninspected.';
console.log('Hit episode with explicit reopenReason:', classifyItem(item, now, { factoryId: 'gmfb', sport: 'nfl', ledger }).status);
