# Association roster workflow completion

Status: Evidence

Stacked on Scout acceptance PR #28. This completes internal discovery and decision preparation, not autonomous roster publication.

- Scout instructions consistently allow qualified new associated voices beyond the add-list. Removed already-rostered Fornelli/Elliott from its candidate seeds.
- Candidate-only runs enter Audit. Candidate speaker/association evidence is distinct from existing-roster verification and does not depend on photos being available.
- Candidate row identity binds proposedId, name, association role/source, and pick evidence. Candidates cannot pass ordinary promoteReadyRows even with a valid mapped pick verdict.
- The read-only roster-proposals CLI prepares per-candidate packets with evidence, missing items, owner, next action, and awaiting-audit/needs-evidence/rejected/ready-for-review state. Readiness never grants roster/photo consent.
- Audit owns independent evidence checks and the initial packet; Promote owns identity/photo/source preparation on publication no-ops; Coordinator surfaces pending decisions. The operator receives a combined roster/photo proposal; event minting remains a separate gate where needed.
- Generated an example packet from the existing afternoon Shows run and linked it in the existing decision queue. Jerry Ostroski remains awaiting Audit, not approved; the team-analyst exclusion remains in force. No source was newly certified by this implementation run.

Verification: npm test passed 479 tests in 49 files; check:fast passed 478 tests plus run validation. Nine new cases exercise candidate-only triggering, ready versus approved, missing photos, rejected/uncertain eligibility, changed candidate identities and stale verdicts. Existing evidence/Scout tests remain green. git diff --check passed.

Methodology impact checked: public roster eligibility, evidence bar, photo consent, grading and market semantics remain unchanged. This implements existing association policy; no public methodology or FAQ change is required. No editorial JSON, production release or social posting. The changes require integration into main before scheduled bots use them. A live candidate discovery/Audit/operator-decision cycle remains the operational acceptance test.
