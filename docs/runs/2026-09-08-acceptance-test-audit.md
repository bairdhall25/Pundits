# Audit — 2026-09-08 acceptance test (Pate hard Intake)

Re-opened independently on branch `codex/scout-acceptance-fixes` @ `8251b1e`. Followed `bots/audit.md`. Did not hunt, promote, grade, mint, or touch `data/`.

**Source:** Apple episode `i=1000788580117` loads (HTTP 200). Linked Omny clip `a6078064-14bf-4657-8131-b4c00017fce1` (Ep 765) loads; independently re-fetched Omny SubRip (byte-identical to Scout copy). Independent Vosk ASR on offset-corrected episode audio confirms each verbatim lean. `PublishedUtc` 2026-09-09T01:54:23Z ⇒ `sourceDate` 2026-09-08 ET. Host Josh Pate = rostered `pate`. Blank `eventSlug`/`side` OK for approved unpublished targets; `targetId`+matchup checked against `docs/capture-targets.json`. `rowIdentity` hashes match staged `rowId`s. No pate restage in `calls.json`.

auditedAt: 2026-09-08T23:49:00-04:00

## Hard Intake

| pundit | eventSlug | side | targetId | matchup | rowId | verdict | note |
|---|---|---|---|---|---|---|---|
| pate |  |  | ncaaf-w2-oklahoma-at-michigan | Oklahoma at Michigan (2026) | 73c9e34debbe7c9b | ok-unmapped | Omny ~22:13 + Vosk: contiguous “but I'm going to slightly lean Oklahoma to win and cover.” Away/YES if mapped. Capsule ≤60w faithful (competitive/not blowout + enough margin). Approved target; blank slug/side OK. |
| pate |  |  | ncaaf-w2-ohio-state-at-texas | Ohio State at Texas (2026) | 11debc61584a7738 | ok-unmapped | Omny ~39:34–39:39 + Vosk: contiguous Texas side across two SubRip cues. Home/NO if mapped. Capsule ≤60w faithful (spring desperation+home field; Week 1 did not flip; min confidence). Same URL ≠ restage across distinct targets. |
| pate |  |  | ncaaf-w2-alabama-at-kentucky | Alabama at Kentucky (2026) | 6e448223ffa0aeee | ok-unmapped | Omny ~57:03 + Vosk: “I think Alabama's going to win this game.” Then separates ATS Kentucky +10.5. Away/YES if mapped. Capsule ≤60w faithful. Cover lean stays Bets-only. |

0 ok / 3 ok-unmapped / 0 ok-no-reasoning / 0 ok-unmapped-no-reasoning / 0 fail / ready to promote 0

K=0: all three are unmapped overflow on approved capture-targets — wait on explicit operator mint; not in K.

## Candidate (optional; not Intake)

| proposedId | note |
|---|---|
| nick-wright | Not hard Intake. Optional only; no verdict required this pass. |

## Run status

Set `docs/runs/2026-09-08-acceptance-test.md` header to `audit=ok` (no hard pick defects). Do not promote. Do not write `data/`.
