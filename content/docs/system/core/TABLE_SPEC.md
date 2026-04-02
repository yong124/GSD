# 경성뎐 : 여급 실종사건 — 데이터 테이블 명세

> `content/data/script.xlsx` 기준. `content/tools/export_to_json.py` 가 이 명세대로 읽어 `game_data.js` 를 생성한다.
> 컬럼명이 `$` 로 시작하면 export 제외. 시트명이 `$` 로 시작하면 시트 전체 제외.

---

## 1. SceneTable

씬(장면) 단위 메타 정보.

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `SceneID` | string | ✅ | 씬 고유 식별자. 영문 소문자+언더스코어 권장. ex) `ch1_court` |
| `Chapter` | int | | 챕터 번호. 챕터 카드 표시 기준. |
| `Title` | string | | 씬 제목. 챕터 카드 및 에디터 표시용. |
| `Background` | string | | 배경 이미지 상대경로. ex) `assets/bg/court.jpeg` |
| `Music` | string | | BGM 상대경로. ex) `assets/sfx/ambient.mp3` |
| `Effect` | string/int | | 씬 진입 시 이펙트. 값: `flicker`(1) / `resonance`(2) / `shake`(3) / `blood`(4) |
| `NextScene` | string | | 대화 종료 후 기본으로 이동할 SceneID. 없으면 씬 종료. |

**관계:** `SceneID` ← DialogTable, ChoiceTable, EvidenceTable, BranchTable 가 모두 참조.

---

## 2. DialogTable

씬에 속한 대사 라인. 한 씬에 여러 줄.

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `SceneID` | string | ✅ | 소속 씬. SceneTable.SceneID 참조. |
| `Order` | int | ✅ | 씬 내 표시 순서. 오름차순 정렬. |
| `Speaker` | string | | 화자 이름. 비어있으면 내레이션 처리. |
| `Text` | string | ✅ | 대사 본문. |
| `Style` | string | | 대사 스타일. 기본값: `normal`. 아래 Style 목록 참조. |
| `Portrait` | string | | 초상화 이미지 상대경로. ex) `assets/portraits/yuu.jpeg` |
| `ConditionKey` | string | | 조건부 대사: 이 플래그 키가 조건값과 일치할 때만 표시. |
| `ConditionValue` | string | | 조건부 대사: ConditionKey 와 함께 사용. |

**Style 목록:**

| 값 | 용도 | 시각 효과 |
|----|------|----------|
| `normal` | 일반 대사 | 기본 |
| `narration` | 내레이션/지문 | 이탤릭, 청색 |
| `thought` | 내면 독백 | 이탤릭, 흐린 색 |
| `crazy` | 광기 상태 | 붉은 색 |
| `scared` | 겁에 질린 상태 | 이탤릭, 회색 |
| `magic` | 세뇌/감응 상태 | 청록색, letter-spacing |

**ConditionKey / ConditionValue 동작:**

```
ConditionKey=editor_rel, ConditionValue=1
→ State.flags["editor_rel"] === 1 일 때만 이 대사 표시
→ 두 컬럼 모두 비어있으면 항상 표시 (condition: null)
```

---

## 3. ChoiceTable

씬 종료 시 표시되는 선택지. 한 씬에 여러 개.

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `SceneID` | string | ✅ | 소속 씬. SceneTable.SceneID 참조. |
| `Order` | int | ✅ | 선택지 표시 순서. |
| `Text` | string | ✅ | 선택지 버튼에 표시될 텍스트. |
| `NextScene` | string | | 선택 시 이동할 SceneID. 비면 씬의 기본 NextScene 사용. |
| `FlagKey` | string | | 선택 시 기록할 플래그 키. |
| `FlagValue` | string | | FlagKey 에 저장할 값. 비면 `true`. |

**동작:**

```
플레이어가 선택 → FlagKey에 FlagValue 기록 → NextScene으로 이동
선택지가 하나도 없으면 → Dialogue 종료 후 씬의 NextScene으로 자동 이동
```

---

## 4. BranchTable ← **신규 추가 필요**

씬 전환 시 플래그 조건에 따라 NextScene을 분기. 위에서부터 순서대로 평가하며 처음 매칭되는 항목 사용.

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `SceneID` | string | ✅ | 소속 씬. SceneTable.SceneID 참조. |
| `Order` | int | ✅ | 평가 우선순위. 낮을수록 먼저 평가. |
| `FlagKey` | string | ✅ | 검사할 플래그 키. |
| `FlagValue` | string | ✅ | 일치 여부를 검사할 값. |
| `NextScene` | string | ✅ | 조건 일치 시 이동할 SceneID. |

**동작:**

```
Dialogue 종료 → Branch 목록을 Order 순으로 순회
→ State.flags[FlagKey] === FlagValue 이면 해당 NextScene으로 이동
→ 일치하는 Branch 없으면 씬의 기본 NextScene 사용
```

**예시:**

| SceneID | Order | FlagKey | FlagValue | NextScene |
|---------|-------|---------|-----------|-----------|
| ch6_ritual_scene | 1 | ending_a_score | 2 | ch6_epilogue_truth |
| ch6_ritual_scene | 2 | called_editor | true | ch6_epilogue_editor |

---

## 5. EvidenceTable

씬에서 수집 가능한 단서.

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `EvidenceID` | string | ✅ | 단서 고유 식별자. ex) `ev_note` |
| `SceneId` | string | ✅ | 소속 씬. SceneTable.SceneID 참조. (소문자 d 주의) |
| `Trigger` | string/int | | 수집 조건. `auto`(1): 씬 진입 시 자동. `click`(2): 대화 완독 시. |
| `Name` | string | ✅ | 단서 이름. 메모장에 표시. |
| `Description` | string | | 단서 설명. 메모장 상세. |
| `Image` | string | | 단서 이미지 상대경로. ex) `assets/items/note.png` |

---

## 관계 다이어그램

```
SCENE (SceneTable)
  │
  ├─── 1:N ──▶ DIALOGUE   (DialogTable)   .SceneID → SCENE.SceneID
  │                │
  │                └── condition: ConditionKey + ConditionValue
  │                    → State.flags 에서 읽음
  │
  ├─── 1:N ──▶ CHOICE     (ChoiceTable)   .SceneID → SCENE.SceneID
  │                │                      .NextScene → SCENE.SceneID
  │                └── 선택 시 FlagKey = FlagValue 기록 → State.flags
  │
  ├─── 1:N ──▶ BRANCH     (BranchTable)   .SceneID → SCENE.SceneID
  │                │                      .NextScene → SCENE.SceneID
  │                └── FlagKey = FlagValue 조건 → State.flags 에서 읽음
  │
  └─── 1:N ──▶ EVIDENCE   (EvidenceTable) .SceneId → SCENE.SceneID


State.flags (런타임 딕셔너리)
  ← CHOICE 가 씀 (flag_key = flag_value)
  → BRANCH 가 읽음 (분기 조건)
  → DIALOGUE.condition 이 읽음 (대사 표시 조건)
```

---

## 플래그 목록 (현재 사용 중)

| 플래그 키 | 세팅 씬 | 가능한 값 | 용도 |
|----------|--------|----------|------|
| `editor_rel` | ch1_newsroom | 0, 1 | 편집장과의 관계 (순응/냉소) |
| `info_level` | ch2_hospital | 1, 2 | 이판규에게 얻은 정보 수준 |
| `ending_a_score` | ch3_room4, ch4b_cafe | 0, 1, 2 | 탐구 적극성 점수 |
| `okryun_pushed` | ch4b_cafe | true | 옥련을 더 캐물었는지 |
| `called_editor` | ch5_ritual_path | true, false | 편집장에게 연락했는지 |
| `final_choice` | ch6_ritual_scene | "a", "b", "c" | 최종 선택 (엔딩 분기) |

---

## 에셋 경로 규칙

```
assets/bg/          ← 배경 이미지 (1280×720 권장, jpg/jpeg/png)
assets/portraits/   ← 캐릭터 초상화 (220×280 권장, jpg/png)
assets/items/       ← 단서 아이템 이미지 (300×200 권장, jpg/png)
assets/sfx/         ← BGM (mp3)
assets/ev/          ← 미사용 (ev 폴더는 현재 연결 안 됨)
```

---

## xlsx 시트 목록

| 시트명 | 상태 | 비고 |
|--------|------|------|
| `SceneTable` | ✅ 있음 | |
| `DialogTable` | ✅ 있음 | `ConditionKey`, `ConditionValue` 컬럼 **추가 필요** |
| `ChoiceTable` | ✅ 있음 | |
| `BranchTable` | ❌ 없음 | **시트 신규 추가 필요** |
| `EvidenceTable` | ✅ 있음 | |
