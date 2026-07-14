---
name: gsd-encoding-recovery
description: Use when Korean text in GSD looks broken (mojibake, ???, 寃쎌꽦 patterns) in any file, terminal, editor, or browser. Diagnoses display problems vs real on-disk corruption, recovers from git history or CP949 round-trip, and prevents re-corruption. Trigger on 한글 깨짐, 인코딩, mojibake, 글자 깨져 보임, 파일 복구.
---

# GSD Encoding Recovery

Use this skill whenever Korean text looks broken anywhere in this repo. Never guess; diagnose in order. This repo has had a real incident: `CLAUDE.md` was saved to disk with CP949 double-encoded mojibake and only git history had the original.

## Step 1 — Rule out display problems (most common)

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Get-Content '경로' -Encoding utf8
```

If the text reads fine now, the file is healthy. Stop. Do not "fix" the file.

## Step 2 — Confirm real corruption at byte level

```bash
file <path>            # encoding + BOM report
head -c 200 <path> | xxd
```

Signs of real corruption:

- Hangul renders as Hanja-heavy garbage (`寃쎌꽦`, `?꾨줈?앺듃`) even under UTF-8 → UTF-8 bytes were decoded as CP949 and re-saved as UTF-8 (double encoding).
- Literal `?` where Hangul should be → those characters were replaced at corruption time and are **permanently lost** in this copy.

## Step 3 — Recover, best source first

1. **Git history** (best): find the last clean commit and use it as the base.

```bash
git log --oneline -- <file>
git show <hash>:<file> | head          # verify it reads clean
git diff <clean-hash> HEAD -- <file>   # see what changed after corruption
```

Rebuild: clean version + re-apply the post-corruption content changes by hand (the corrupted-commit diffs usually contain real edits worth keeping).

2. **CP949 round-trip** (only if git has no clean copy): per line, `line.encode('cp949').decode('utf-8')`; keep lines that fail as-is. Report `?`-replaced characters as unrecoverable — do not invent replacement text.

3. Save the recovered file as UTF-8. Verify with Step 1 before declaring done.

## Step 4 — Prevent recurrence

- Korean bulk edits go through a precise patch tool (Edit / apply_patch), never PowerShell/shell inline strings.
- PowerShell 5.1 `Out-File`/`Set-Content` default to UTF-16; always pass `-Encoding utf8` when a script writes files other tools read.
- After any tool writes Korean, spot-check one Korean line in UTF-8 before committing.

## Do not

- do not overwrite a possibly-corrupted file before checking git for a clean version
- do not run bulk re-encoding across the repo; recover file by file
- do not treat terminal mojibake alone as proof of corruption
- do not fabricate text for `?`-lost characters — flag them for the user

## Done when

- the diagnosis (display problem vs real corruption) is stated explicitly
- recovered file reads clean via the Step 1 check
- post-corruption edits were preserved, not silently dropped
- unrecoverable spots, if any, are listed for the user
