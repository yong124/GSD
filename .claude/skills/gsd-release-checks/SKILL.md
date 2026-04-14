---
name: gsd-release-checks
description: Use when wrapping up a GSD work round, verifying data and runtime safety, updating handoff notes, checking cache/version bumps, and preparing a clean commit.
---

# GSD Release Checks

Use this skill near the end of a work round.

## Example prompts

- `이번 라운드 마감 체크하고 handoff 갱신해줘`
- `커밋 전에 validate랑 generated까지 정리해줘`
- `워크트리 마무리하고 남은 리스크까지 요약해줘`

## Checklist

1. Check worktree.

```powershell
git status --short
```

2. If `game_data.js` changed:

```powershell
py G:\GSD\content\tools\validate_game_data.py
```

3. If browser runtime files changed:

- verify touched JS with `node --check`
- verify `game/index.html` version bumps when needed

4. If pipeline/schema changed:

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py
```

5. Update handoff when the thread materially changes project state:

- `G:\GSD\content\docs\portfolio\다음_스레드_인수인계.md`

6. Clean up temporary folders created for QA or tooling.
7. If browser QA was part of the round:
   - confirm the local game server is reachable before the script runs
   - prefer the scene-local Playwright runners before a giant full run
   - use `G:\GSD\.claude\skills\gsd-browser-qa\SKILL.md` for progression QA
   - keep `G:\GSD\content\docs\system\core\브라우저_QA_실행_가이드.md` in sync with the actual workflow

## Do not

- do not leave cache/temp folders in the worktree
- do not claim a browser fix without checking cache-bust handling
- do not forget handoff updates after major project-state changes
- do not mix unrelated work into a single vague commit if the scope is clearly separable
- do not treat `ERR_CONNECTION_REFUSED` as a runtime bug before checking whether the local server is simply down

## Commit guidance

Prefer commit messages that reflect the actual slice of work, such as:

- 조사 시스템 보강
- UI UX 폴리시 개선
- HUD 컨텍스트 수정
- 에디터 파이프라인 확장

## Watchouts

- Do not leave behind cache/test temp folders.
- Do not describe work as finished if browser cache can still hide the fix.
- Browser QA depends on a live local server. Wrapper scripts are safer than raw `node` entrypoints.
- For Korean choice text, prefer action indices over env-passed strings.

## Final response pattern

When wrapping up, prefer this order:

1. what changed
2. what was validated
3. what still needs QA or follow-up

## Done when

- worktree state is understood
- required validation has run for the touched layer
- browser QA wrappers were used when browser automation was part of the task
- temporary artifacts are cleaned up
- handoff is updated if needed
- commit scope can be explained in one line
