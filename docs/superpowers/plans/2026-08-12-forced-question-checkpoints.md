# Forced Question Checkpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 조사 결론 시점에 질문을 강제로 열고, 답변별로 정답·침식·평판·후속 결과를 적용한다.

**Architecture:** 새 `QuestionAnswerTable`은 유지하되 별도 질문 프레임워크는 만들지 않는다. 기존 `evidence.js`의 질문 로직, `UIManager.renderChoiceList`, `Choice.applyEffectGroup`, 씬 전환 흐름을 재사용한다. 씬에는 필요한 두 필드(`forced_question_ids`, `question_mode`)만 추가하고 질문은 장면 이탈 직전에 실행한다.

**Tech Stack:** 정적 HTML/CSS/JavaScript, JSON 테이블, Python 데이터 파이프라인, Node 기반 QA

## Global Constraints

- 외부 의존성을 추가하지 않는다.
- 질문 문구와 답변 결과는 데이터에 두고 런타임 상수로 넣지 않는다.
- 한국어 데이터는 `apply_patch`로만 작성한다.
- `game_data.js`와 `game/data/tables/*.json`을 동기화한다.
- 침식 10은 `scene_gameover_erosion`, 평판 0은 `scene_gameover_credibility`로 이동한다.
- 수첩 질문 탭은 읽기 전용이며 질문 해결은 강제 체크포인트에서만 가능하다.
- Ponytail: `question.js`, 신규 모달, 신규 CSS는 만들지 않는다. 실제로 두 번째 트리거 위치가 필요해질 때만 `question_trigger`를 추가한다.

---

### Task 1: 답변 테이블과 체크포인트 데이터

**Files:**
- Create: `game/data/tables/question_answers.json`
- Modify: `game/data/tables/scenes.json`
- Modify: `game/data/tables/effects.json`
- Modify: `game/data/tables/gauge_states.json`
- Modify: `game/data/tables/questions.json`
- Modify: `content/tools/split_game_data.py`
- Modify: `content/tools/validate_game_data.py`
- Modify: `content/tools/export_to_json.py`
- Modify: `content/tools/json_to_generated_xlsx.py`
- Modify: `game/data/game_data.js` (bundle 생성)

**Interfaces:**
- Produces: `GAME_DATA.question_answers: QuestionAnswer[]`
- Produces: `scene.forced_question_ids: string[]`, `scene.question_mode: "All" | "Any"`
- `QuestionAnswer`: `{ answer_id, question_id, sort_order, answer_text, required_evidence_ids, is_correct, effect_group_id, result_text, next_type, next_id }`

- [ ] **Step 1: validator에 실패 조건 추가**

`validate_question_answers(data, issues)`를 추가해 ID 중복, 존재하지 않는 질문·단서·효과·후속 씬, 질문별 정답 부재, 항상 선택 가능한 답변 부재, 잘못된 `next_type`을 오류로 기록한다. 강제 질문 ID와 `question_mode`도 검사한다.

- [ ] **Step 2: 현재 데이터에서 validator 실패 확인**

Run: `py content/tools/validate_game_data.py`

Expected: `question_answers` 또는 강제 질문 답변 누락 오류

- [ ] **Step 3: 최소 데이터 구조와 콘텐츠 작성**

기존 10개 질문마다 정답·침식형 오답·평판형 오답을 한 개씩 작성한다. 공통 효과 그룹은 세 개만 재사용한다.

```json
{"effect_group_id":"eff_question_erosion","effect_type":"GaugeChange","gauge_id":"Erosion","gauge_delta":1}
{"effect_group_id":"eff_question_credibility","effect_type":"GaugeChange","gauge_id":"Credibility","gauge_delta":-1}
{"effect_group_id":"eff_question_both","effect_type":"GaugeChange","gauge_id":"Erosion","gauge_delta":1}
{"effect_group_id":"eff_question_both","effect_type":"GaugeChange","gauge_id":"Credibility","gauge_delta":-1}
```

체크포인트는 다음 다섯 곳에 둔다.

```text
ch2_factory_shock: QIpangyuCall
ch2_well: QIpangyuMadness, QCallPattern
ch3_room4_conclusion: QSonggeumMissing, QSonggeumRunaway, QRoom4Purpose
ch4a_slum: QArchivePattern
ch5_ritual_room: QRitualLead, QRitualAccident, QRitualErasure
```

- [ ] **Step 4: 파이프라인에 QuestionAnswerTable 추가**

`question_answers.json ↔ question_answers ↔ QuestionAnswerTable` 매핑을 split, XLSX import/export에 추가한다. `questions.json`의 기존 정답 필드는 호환용으로 남기되 런타임 판정에는 사용하지 않는다.

`Erosion`의 10 상태가 `scene_gameover_erosion`을 가리키도록 기존 게이지 상태 행도 바로잡는다.

- [ ] **Step 5: tables에서 번들 생성 후 검증**

Run: `py content/tools/split_game_data.py bundle`

Run: `py content/tools/validate_game_data.py`

Expected: PASS

- [ ] **Step 6: 커밋**

```powershell
git add game/data content/tools
git commit -m "feat: add authored question answer data"
```

### Task 2: 강제 질문 런타임

**Files:**
- Modify: `game/js/engine/evidence.js`
- Modify: `game/js/engine/scene.js`
- Modify: `game/js/managers/ui.js`
- Modify: `game/index.html`
- Create: `.qa-node/question_checkpoint_check.js`

**Interfaces:**
- Produces: `Evidence.startQuestionCheckpoint(scene, onComplete): boolean`
- Reuses: `Choice.applyEffectGroup(effectGroupId): Effect[]`
- Reuses: `UIManager.renderChoiceList(choices, onPick, meta)`

- [ ] **Step 1: 최소 브라우저 체크가 실패하는지 확인**

`.qa-node/question_checkpoint_check.js`에서 `ch2_factory_shock`를 열고 대사를 끝낸 뒤 질문 헤더와 세 답변이 자동 표시되는지 검사한다.

Run: `node .qa-node/question_checkpoint_check.js`

Expected: FAIL because forced checkpoint is not implemented

- [ ] **Step 2: 체크포인트 시작과 답변 표시 구현**

`Evidence.startQuestionCheckpoint`는 완료 fact를 확인하고, 질문 목록을 순서대로 보여주며, 보유하지 않은 `required_evidence_ids`가 있는 답변을 `locked`로 전달한다. 메타는 다음 형태를 사용한다.

```js
{
  kicker: '추론',
  title: question.title,
  hint: `${current + 1} / ${total} · 단서와 진술을 바탕으로 결론을 고르십시오.`
}
```

- [ ] **Step 3: 답변 결과와 상태 기록 구현**

답변 선택 시 `State.recordChoice(answer.answer_id)`를 호출한다. 정답은 기존 `markQuestionSolved`, `SolvedQuestionCount`, 질문 보상을 한 번만 적용한다. 오답은 해결 상태를 만들지 않는다. 모든 답변은 `QuestionAnswered_<SceneID>_<QuestionID>`를 기록한다.

- [ ] **Step 4: 효과·게임오버·후속 진행 구현**

`result_text`를 toast로 먼저 보여준 뒤 `Choice.applyEffectGroup`을 적용한다. 게이지 상태 리스너가 게임오버 씬으로 전환했다면 질문 진행을 중단한다. 아니면 `All`은 다음 질문, `Any`는 체크포인트 완료로 간다. `next_type === "Dialog"`이면 현재 씬의 `evidence_dialogues[next_id]`를 재생한 뒤 질문 흐름을 계속하고, `next_type === "Scene"`이면 지정 씬으로 이동한다. `Resume`은 보류된 원래 전환을 재개한다.

- [ ] **Step 5: 씬 이탈을 한 함수로 모아 체크포인트 연결**

`scene.js`에 `leaveScene(scene, nextSceneId)`를 두고 직접 `Scene.load`하던 최종 이탈과 `loadResolvedNext`를 이 함수로 통과시킨다. 대사 라벨 이동은 같은 씬이므로 가로채지 않는다.

- [ ] **Step 6: 수첩 질문 탭을 읽기 전용으로 변경**

질문 제출·토글·커밋 버튼을 제거하고 해결 여부, 선택한 답변 결과, 관련 단서만 표시한다. 기존 상태·인물·단서 탭은 유지한다.

- [ ] **Step 7: 캐시 버전과 구문 검사**

`game/index.html`에서 수정한 JS의 `?v=`를 올린다.

Run: `node --check game/js/engine/evidence.js && node --check game/js/engine/scene.js && node --check game/js/managers/ui.js`

Expected: PASS

- [ ] **Step 8: 커밋**

```powershell
git add game/js game/index.html .qa-node/question_checkpoint_check.js
git commit -m "feat: force question checkpoints during scene flow"
```

### Task 3: EditorNode 답변·체크포인트 편집

**Files:**
- Modify: `EditorNode/editor.js`
- Modify: `EditorNode/editor-data-panels.js`
- Modify: `EditorNode/editor-data-ui.js`
- Modify: `EditorNode/index.html`

**Interfaces:**
- Consumes: `question_answers`, `forced_question_ids`, `question_mode`
- Produces: tables와 bundle에 같은 필드를 보존하는 EditorNode 저장 payload

- [ ] **Step 1: 로드·저장 보존 실패 확인**

EditorNode의 `EMPTY_DATA`, `TABLE_FILE_MAP`, `buildTablePayloadMap`, `normalizeData`, `buildPayload`에 `question_answers`가 없는 현재 상태를 코드 검색으로 확인한다.

- [ ] **Step 2: QuestionAnswerTable 로드·저장 추가**

질문 탭 안에 답변 카드 목록을 추가한다. 필드는 `AnswerID`, `QuestionID`, `SortOrder`, `AnswerText`, `RequiredEvidenceIDs`, `IsCorrect`, `EffectGroupID`, `ResultText`, `NextType`, `NextID`만 제공한다.

- [ ] **Step 3: 씬 체크포인트 필드 추가**

씬 속성 패널에 `ForcedQuestionIDs`와 `QuestionMode`를 추가하고 `normalizeScene`과 payload에 보존한다. 질문 ID는 쉼표 구분 입력을 배열로 정규화한다.

- [ ] **Step 4: EditorNode 검증과 구문 검사**

존재하지 않는 질문·단서·효과 참조를 구조 검수 항목에 추가한다.

Run: `node --check EditorNode/editor.js && node --check EditorNode/editor-data-panels.js && node --check EditorNode/editor-data-ui.js`

Expected: PASS

- [ ] **Step 5: 커밋**

```powershell
git add EditorNode
git commit -m "feat: edit question answers and checkpoints"
```

### Task 4: 통합 QA와 생성 산출물

**Files:**
- Modify: `content/generated/script.generated.xlsx`
- Modify: `content/generated/script.generated_delimited/*QuestionAnswerTable*`
- Modify: `.qa-node/question_checkpoint_check.js`

**Interfaces:**
- Verifies: 단일·복수 질문, 정답·오답, 양쪽 게이지 게임오버, 저장 복원, 최종 폭로 조건

- [ ] **Step 1: 생성 XLSX 갱신**

Run: `py content/tools/json_to_generated_xlsx.py`

Expected: `QuestionAnswerTable` 시트 생성

- [ ] **Step 2: 정적 검증**

Run: `py content/tools/validate_game_data.py`

Run: `node --check game/data/game_data.js`

Run: `git diff --check`

Expected: PASS

- [ ] **Step 3: 질문 체크포인트 QA**

Run: `node .qa-node/question_checkpoint_check.js`

Expected: 단일 질문 자동 진입, 복수 질문 순차 진행, 정답 해결, 침식 오답, 평판 오답, 게임오버, 재진입 방지 모두 PASS

- [ ] **Step 4: 기존 회귀 QA**

Run: `node .qa-node/qa_fast_batch.js`

Expected: 대상 씬 boot/choice failures 0

- [ ] **Step 5: 최종 커밋과 푸시**

```powershell
git add content/generated .qa-node game EditorNode content/tools docs/superpowers
git commit -m "test: verify forced question progression"
git push
```
