---
name: gsd-content-review
description: Use when reviewing GSD portfolio, PPT, PDF, slide copy, captions, or project summaries for factual accuracy, structure, claim safety, message clarity, and reference-fit. Trigger on requests like 내용검증, 문구 검토, 주장 점검, 흐름 점검, 사실 확인, 제출 전 점검, or when a deck should be checked to feel more like the portfolio references in content/docs/portfolio/Ref.
---

# GSD Content Review

Use this skill for content review only.

Focus on:

- factual mismatch
- claim inflation
- missing logic
- duplicated ideas
- weak slide-to-slide flow
- wording that hurts positioning
- mismatch against the reference portfolio tone

Do not spend tokens on visual polish here. That belongs to `gsd-design-review`.

## Goal

Find the few issues that keep the deck from reading like a strong, submission-ready portfolio in the same family as the reference materials.

## Review order

1. message fit
2. fact/source fit
3. reference-fit
4. slide flow
5. wording risk
6. only then minor cleanup

## Hard rules

- prefer project docs over memory
- use `content/docs/portfolio/Ref` as a style target, not just as a comparison target
- do not invent achievements, metrics, or tools
- do not praise by default
- do not rewrite everything when two lines would fix it
- do not list tiny nits before high-impact issues
- if a line is acceptable, leave it alone

## Required checks

### 1. Positioning

Check that the deck reads as:

- system planner
- structure / tool / pipeline designer

Not as:

- just narrative writer
- just UI maker
- just AI-assisted project

### 2. Reference-fit

Check whether the deck feels like the reference portfolio materials:

- sharper result wording
- clearer evidence-to-claim relationship
- simpler per-slide message
- less repetition
- stronger "what I did / why it mattered" framing

Do not ask whether the new deck is identical to the references.
Ask whether it belongs to the same quality and communication family.

### 3. Claim safety

Flag any sentence that:

- overstates completion
- implies team scale or production scope not supported by docs
- treats placeholder visuals as real proof
- turns AI assistance into the main achievement

### 4. Flow

Check that the deck moves through:

- problem
- design decision
- structure
- tool/pipeline
- result
- reflection

If a slide breaks that logic, call it out.

### 5. Compression

Prefer fewer, sharper points.

Flag:

- repeated claims
- long sentences that can be split
- paragraphs explaining what a diagram already shows
- slides that say the same thing with different wording

## Output format

Use this exact order:

1. `critical`
2. `important`
3. `minor`
4. `safe to keep`

Rules:

- each item: one line
- cite slide/file when possible
- if no issue in a section, omit that section
- keep `safe to keep` to max 3 lines

## Good finding examples

- `critical: Slide 2 says the project 'built a full production pipeline', but the source docs support an internal portfolio-scale workflow, not a production pipeline claim.`
- `important: Slide 10 talks about outcomes, but unlike the reference career deck it does not yet show evidence strong enough for that level of result wording.`
- `important: Slide 6 repeats the same Condition-based restructuring point already made in Slide 5, so the deck loses momentum.`
- `minor: Slide 11 opening sentence is too long and hides the actual takeaway.`

## Done when

- the biggest message risks are identified
- unsupported claims are flagged
- reference-family mismatch is called out when present
- repeated or weak slides are called out
- the final output is short enough to act on immediately
