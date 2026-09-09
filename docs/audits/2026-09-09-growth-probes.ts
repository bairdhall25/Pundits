// Read-only probes. Run: npx tsx docs/audits/2026-09-09-growth-probes.ts
import { inferCoverageState, decideNovelty } from '../../lib/social-select';
import { captureMetrics } from '../../lib/capture-metrics';
import { fixtureCall, fixtureGame } from '../../lib/test-fixtures';
const event = fixtureGame('fixture-2026', { kickoffDate: '2026-09-09' });
const call = fixtureCall({ id: 'fixture', punditId: 'fixture', eventSlug: event.slug, side: 'yes', claim: 'Away wins.', sourceDate: '2026-08-01', firstPublishedAt: '2026-09-09T12:00:00Z' });
const metrics = captureMetrics({ calls: [call], events: [event], targets: [{ id: 'target', state: 'approved', eventSlug: event.slug }], sourceHours: 2, asOf: '2026-09-10' });
console.log('Date-only kickoff vs noon publication:', metrics.preKickoffLead);
console.log('Historical inventory divided by supplied hours:', metrics.picksPerSourceHour);
const state = inferCoverageState("Nick Wright picks Seattle to win 27–17 before kickoff.", 'event');
console.log('Pregame score prediction classified as:', state);
if (state !== 'unknown') console.log('Same pregame story allowed again:', decideNovelty('https://pundits.pro/picks/fixture-2026/', 'pregame', { established: true, records: [{ destination: 'https://pundits.pro/picks/fixture-2026/', state, postedAt: '2026-09-08' }] }));
