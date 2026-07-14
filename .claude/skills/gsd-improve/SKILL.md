---
name: gsd-improve
description: Use when improving GSD portfolio slides, PPT, PDF, captions, layouts, or supporting docs after review. Trigger on requests like 개선, 수정, 다듬기, polish, refine, revise, fix the deck, or when applying findings from content/design review to make the deck feel closer to the references in content/docs/portfolio/Ref with minimal churn and clear priority.
---

# GSD Improve

Use this skill when the task is to change the work, not just review it.

This skill assumes the target may be:

- slide copy
- PPT layout
- placeholder structure
- summary docs
- export readiness

## Goal

Apply the smallest set of edits that gives the biggest improvement while moving the deck closer to the reference portfolio family.

## Priority rule

Always fix in this order:

1. broken facts or risky claims
2. unreadable or unstable slides
3. reference-family mismatch
4. weak positioning
5. repeated/low-value text
6. cosmetic polish

## Hard rules

- preserve the chosen portfolio positioning
- preserve `Noto Sans KR`
- preserve the "reference-like" direction once chosen
- do not drift into a totally new concept unless asked
- do not create extra slides unless the user asks
- do not replace placeholders just for decoration
- do not rewrite every slide if only 3 slides are weak

## Default workflow

1. inspect current deck/doc state
2. inspect relevant files in `content/docs/portfolio/Ref`
3. identify top 3 leverage fixes
4. apply only those first
5. re-check export/readability
6. summarize what changed and what still remains

## Improvement heuristics

### Content

- compress repeated ideas
- sharpen the first sentence on each slide
- make result statements more concrete
- reduce AI emphasis if it starts overshadowing system design
- if a slide is weaker than the references, simplify before adding more text

### Design

- fix hierarchy before color tweaks
- fix spacing before adding new elements
- prefer moving/resizing over redesigning
- use placeholders as structured proof slots, not apology boxes
- make visuals behave like proof, explanation, or planned slots, as in the references

### Submission quality

Before calling it done, confirm:

- titles are clear at a glance
- body copy is readable in PDF
- slide order still supports the argument
- no slide feels obviously unfinished
- the deck feels like it belongs to the same portfolio family as the references

## Output format

When reporting back, use this order:

1. `changed`
2. `validated`
3. `remaining`

Keep it short.

## Done when

- the highest-leverage issues are fixed
- unchanged parts still fit the deck
- output is stronger without unnecessary churn
