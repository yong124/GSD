---
name: game-narrative-review
description: "스코어 및 품질 점검을 통해 game_data.js 등 경성 게임 엔진의 내러티브 데이터를 평가합니다. '게임 내러티브 리뷰해줘', '데이터 검증해줘', '진행 구조 확인해줘' 등의 요청 시 사용할 수 있습니다."
allowed-tools: Read, Write, Edit, Glob, Grep
---

## Purpose
`insight-wave`의 `narrative-review` 원리를 차용하여, 마크다운 컨설팅 문서가 아닌 **우리 프로젝트의 게임 내러티브(`data/game_data.js`)**를 검증하기 위한 전용 스킬(프롬프트)입니다. 조건 맵 분기, 증거 논리 검사, 내러티브의 질적 평가를 통해 버그나 설정 구멍(Plot hole)을 사전에 막고 점수(Scorecard)를 매깁니다.

## When to Use
- 새로운 챕터, 선택지, 사건 단서를 추가한 후 논리적 모순이 없는지 확인할 때
- 플래그 꼬임, 미사용 증거, 끊어진 씬이나 대화를 점검할 때
- 현재 작성된 내러티브가 1930년대 경성 오컬트 테마 문체에 적합하게 작성되었는지 평가할 때

---

## 🔍 Quality Gates (평가 기준)

### 1. 🏗️ 구조 검사 (Structural Gate) - 30점 만점
`game_data.js` 내부의 논리 연결 상태를 평가합니다.
- **연결 확인**: `choice_groups`, `conditions`, `questions` 등에서 정의된 ID(`condition_target_id` 등)가 서로 정확히 맵핑되는지. 알 수 없는 ID나 오타가 있는가?
- **엔드 포인트 검사**: 챕터나 씬의 분기가 막힌 곳(Dead link) 없이 적어도 하나 이상의 조건으로 흘러갈 수 있는지 확인.
- **보상 무결성**: 질문 당 보상(`reward_state_id`, `reward_value`)이 제대로 명시되어 있는가? (예: `ResonanceLevel`, `InvestigationScore`)

### 2. 🧩 증거/조건 논리 검사 (Evidence Logic Gate) - 25점 만점
증거 획득 여부와 사건 해결 로직의 정합성을 평가합니다.
- **질문 로직**: `questions` 항목에서 `related_evidence_ids`와 `solution_evidence_ids`가 모순 없이 배치되었는가? (해결 증거가 관련 증거에 포함되어야 함)
- **모순 판별**: `resolution_type: "Contradiction"`일 경우, `contradiction_statement`를 명확히 뒤집을 수 있는 단서가 할당되었는지 평가.
- **사용 빈도**: 전혀 사용되지 않는 증거나 잉여 플래그가 있는지 확인 (Warn 처리).

### 3. ✍️ 내러티브/문체 검사 (Narrative & Tone Gate) - 25점 만점
작성된 텍스트 구간(`detail`, `resolved_detail`, `contradiction_statement` 등)을 질적으로 평가합니다.
- **세계관 톤앤매너**: "1930년대 일제강점기 경성", "오컬트(크툴루 신화)", "녹아내리는 광기"라는 테마에 맞게 차갑고 건조하며 때론 기괴한 문체를 구사하고 있는가? 어색한 현대어, 유행어 사용은 없는지?
- **설명충 방지 비율**: 인물의 `resolved_detail`이나 `detail`이 노골적으로 세계관의 진실을 떠먹여주진 않는가? 상징과 은유, 광기어린 혼잣말을 통해 미스터리를 유지하고 있는지 평가.

### 4. ⚖️ 밸런스 검사 (Balance Gate) - 20점 만점
시스템 변입(공명치, 진행도 등)의 균형을 검사합니다.
- 특정 챕터에 과도하게 `ResonanceLevel(공명치)`이 오르는 보상이 밀집되지 않았는지 평가.
- `SD_Resonance_X` 스테이트 묘사가 단계별로 충분히 긴장감을 고조시키는지 평가.

---

## 🛠️ 실행 및 리포트 작성 가이드 (AI 요원 행동수칙)

1. **데이터 로드**:
   - 사용자가 리뷰를 요청하면, `view_file`를 이용해 `g:\GSD\game\data\game_data.js` (또는 지정된 텍스트/스크립트 파일)를 로드한다.
   - 필요시 씬 디바이더나 대화 JSON 등을 함께 확인한다.

2. **게이트별 심사 진행 (Scoring)**:
   - 위 4개 게이트 기준에 맞춰, 발견된 논리 오류 결함의 개수당 -5점씩 차감 (최소 0점 보장).
   - 단순 어색함/경고의 경우 1~2점 차감.

3. **결과 보고 (Scorecard 생성)**:
   - 평가가 끝나면 아래와 같은 형태의 마크다운 표와 총평 텍스트로 응답(또는 `game-narrative-review-report.md` 양식으로 아티팩트 작성)한다.

```markdown
# 📋 경성뎐 내러티브 리뷰 완료 (Game Narrative Review)

**대상 파일:** `game_data.js` | **총점:** 88 / 100점 (Grade: B)

### 📊 심사 결과
| 게이트 | 상태 | 점수 | 주요 내용 |
| --- | --- | --- | --- |
| 🏗️ 구조 검사 | Pass | 30/30 | 연결된 분기 조건 ID 누락 없음 확인. |
| 🧩 증거 논리 | Warn | 20/25 | 일부 질문(QId)의 관련 증거가 1개뿐이어, 추리 난이도가 너무 낮음. |
| ✍️ 내러티브 | Pass | 23/25 | 대사 및 해설 문체가 전반적으로 건조하고 일관됨. |
| ⚖️ 밸런스 | Pass | 15/20 | 공명치 오르는 구간이 챕터 3에 약간 편중됨. |

### 💡 핵심 개선 권고사항 (Top 3 Improvements)
1. `QSonggeumMissing` 사건에서 오답 함정이 될 더미 증거 아이디 추가 권장.
2. 해결 텍스트(`resolved_detail`) 중 일부가 너무 구체적이어서 모호함/미스터리가 줄어드는 구간 재수정 권장(라인 X).
3. "..."
```

---
Constraints:
- 절대로 추측성으로 평가하지 말 것. `game_data.js`에 존재하는 명확한 밸류 텍스트나 조건식을 바탕으로 논리 검증을 할 것.
- JSON 파싱 오류나 스택 초과를 유발하는 콤마 빠짐 등의 문법적 결함은 다른 게이트 평가 이전에 **가장 먼저(Critical 오류)** 알려야 함.
