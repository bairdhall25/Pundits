# Editorial, attribution, and corrections policy

Status: Canonical

## Trust standard

Pundits.Pro should be able to defend every published mapped pick with the public evidence available at capture time. Automation may help find and structure evidence; it does not lower the publication bar.

## What qualifies as a mapped pick

A mapped pick requires:

- A named person, not an outlet, show, staff, or anonymous group.
- A public statement attributable to that person.
- A verbatim decisive quote preserved without changing its meaning.
- A source URL and publication date.
- A specific tracked event or future.
- An explicit side that matches the event contract.
- Objective resolution criteria.

Schedules, transactions already completed, contract status, reporting about negotiations, descriptive analysis, conditional possibilities, fantasy mocks, and generic optimism are not game-winner predictions unless the speaker clearly makes the relevant forward-looking call.

## Source hierarchy

Prefer, in order:

1. Original video, audio, transcript, article, newsletter, or social post containing the statement.
2. An official outlet clip or transcript that preserves the speaker and context.
3. A reputable secondary source quoting the statement verbatim and linking or clearly identifying the original appearance.

Record the source actually opened and verified. When a secondary source is necessary, label it honestly; do not make it appear to be the original source. Preserve enough context to distinguish a firm pick from a joke, question, hypothetical, or paraphrase.

## Quote handling

- Keep the decisive quote as short as practical while preserving meaning.
- Do not splice separate statements into a stronger claim.
- Use an optional reasoning capsule only for factors the same speaker gave in the same source.
- Do not add model-generated rationale or editorial certainty.
- Do not silently update a quote because a later source phrases the idea more cleanly.
- Capture at most one mapped call per pundit and event; a repeated appearance or syndication is evidence for the same call, not a new independent pick.

## Mapping and grading independence

The market price does not determine whether a claim qualifies. Popularity, celebrity, odds, expected traffic, and the desire to fill an empty side must not affect mapping.

Grade the proposition that was published, using authoritative outcome evidence. Do not reinterpret the original claim after the result is known. A surprising outcome is not a reason to revisit an otherwise correct pre-event mapping.

## Correction classes

### Metadata correction

Examples: spelling, outlet, broken source URL replacement, kickoff/network, or non-substantive display text. Correct the field, preserve the URL, and record the reason in the promotion/run history.

### Attribution or mapping correction

Examples: wrong speaker, wrong event, wrong side, edited quote that changed meaning, or a statement that never qualified. This is material. Remove it from performance calculations without deleting the permanent public receipt; display a corrected/void state once the model supports it, and preserve the original evidence and correction note.

### Grade correction

Examples: wrong result, grading before final settlement, or inconsistent interpretation. Restore the correct grade, record the authoritative evidence, update `gradedAt`/future correction metadata, and ensure every derived record reconciles.

## Current model gap

The implemented status model has only `pending`, `hit`, and `miss`. It lacks `void`, `corrected`, dispute metadata, and an explicit event result. Until those states are designed:

- Do not delete a disputed published object.
- Stage an operator-reviewed correction for Promote so the disputed object stops affecting records; do not mutate editorial JSON from another role.
- Record the issue and decision in a dated run/audit note.
- Escalate material ambiguity to the operator before promotion.

A future correction model should be append-only and expose what changed, why, when, and based on which evidence.

## Rights and relationship risks

- Use public statements only and quote no more than needed for identification, context, and commentary.
- Link to the source and avoid reproducing full articles or transcripts.
- Keep pundit photos and team marks traceable to approved sources and usage decisions.
- Do not imply endorsement, affiliation, participation, or that a pundit placed a bet.
- Do not sell favorable treatment, removal, or altered grading.
- Review market-data and partner terms before commercial reuse, syndication, or API licensing.

This policy is product guidance, not legal advice. Material licensing, publicity-rights, defamation, or commercial-syndication questions require qualified legal review.

## Disputes

A future public dispute path should request:

- The permanent Pundits.Pro URL.
- The contested quote, mapping, or grade.
- The proposed correction.
- A public authoritative source.
- Contact information kept outside analytics.

Publish the outcome and rationale for material corrections. Accountability applies to Pundits.Pro too.
