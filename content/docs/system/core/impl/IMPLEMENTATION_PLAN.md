# 구현 전체 계획

## 개요

이 문서는 경성뎐 게임성 강화 작업의 전체 구현 범위와 순서를 정의한다.
각 단계의 세부 명세는 `STEP_0N_*.md` 파일을 참조한다.

---

## 배경

기존 경성뎐은 비주얼노벨에 가까운 구조였다. 증거는 받기만 하고 쓰이지 않았고, 질문 시스템은 수첩 안에 갇혀 게임에 아무 영향이 없었다.

이번 작업은 경성뎐을 **조사형 ADV**로 전환하는 것이 목표다.

핵심 변화는 세 가지다.

1. **증거를 쓰는 행위가 생긴다** — 대화 중 특정 발언에 증거를 제시해서 새 증언을 끌어낸다.
2. **수치가 체감된다** — 침식과 신용이 HUD에 상시 표시되고, 잘못된 선택이 실제 대가를 낳는다.
3. **끝이 있다** — 기사 작성 클라이맥스에서 수집한 증거로 진실을 조합하고, 그 결과가 엔딩을 결정한다.

---

## 전체 구조 변화 요약

### 추가되는 것

| 항목 | 설명 |
|---|---|
| GaugeTable / GaugeStateTable | 수치(침식, 신용) 테이블 기반 정의 |
| EffectTable | 선택지/대사 효과 분리 관리 |
| AnswerType: Evidence | 증거 인벤토리 UI로 선택지 제시 |
| HUD 게이지 | 침식/신용 상시 표시 |
| SceneVisited 조건 | 씬 방문 여부 판정 |
| Trust API | 캐릭터별 신뢰도 런타임 관리 |

### 제거되는 것

| 항목 | 설명 |
|---|---|
| Flag 시스템 | 임의 키-값 상태 전면 제거 |
| InvestigationTable | SceneTable + ChoiceGroupTable로 흡수 |
| 구 ConditionType | SongsoonTrust, ResonanceLevel 등 특화 타입 제거 |
| Choice 효과 컬럼 | trust_value, resonance_value, state_type 등 제거 |
| 레거시 Scene 필드 | priority_*, next_scene 등 제거 |

---

## 단계 구성

```
STEP 01  게이지 시스템     기반 수치 구조 구축
STEP 02  이펙트 시스템     효과 분리 + Choice/Dialog 연결
STEP 03  Choice 확장      증거 제시 UI 구현
STEP 04  HUD 개편         게이지 상시 표시
STEP 05  Condition 재정의  조건 판정 범용화
STEP 06  레거시 제거       구 필드/코드 전면 정리
```

각 단계는 앞 단계 완료 후 진행한다. STEP 01이 기반이므로 가장 먼저 진행해야 한다.

---

## 의존 관계

```
STEP 01 (게이지)
 ├─ STEP 02 (이펙트) 의존
 │   └─ STEP 03 (Choice 확장) 의존
 ├─ STEP 04 (HUD) 의존
 └─ STEP 05 (Condition) 의존

STEP 06 (레거시 제거)
 └─ STEP 01~05 전부 완료 후 진행
```

---

## 파일별 작업 분포

| 파일 | 관련 STEP |
|---|---|
| `game/data/game_data.js` | 01, 02, 03, 05, 06 |
| `game/js/engine/state.js` | 01, 05 |
| `game/js/engine/scene.js` | 01, 05, 06 |
| `game/js/engine/choice.js` | 02, 03, 06 |
| `game/js/engine/dialogue.js` | 02, 06 |
| `game/js/managers/ui.js` | 03, 04 |
| `game/index.html` | 04 |
| `game/css/` | 04 |
| `content/tools/export_to_json.py` | 01, 02, 05, 06 |
| `content/tools/validate_game_data.py` | 01, 02, 05, 06 |
| `EditorNode/editor.js` | 01, 02, 03, 05, 06 |
| `EditorNode/index.html` | 06 |

---

## 경성뎐 데이터 마이그레이션 범위

STEP별로 아래 데이터를 새 구조에 맞게 변환한다.

| STEP | 마이그레이션 내용 |
|---|---|
| 01 | `gauges`, `gauge_states` 초기 데이터 삽입 |
| 02 | 기존 choice의 trust/resonance/state 효과 → EffectTable로 이전 |
| 03 | 증거 제시 씬의 ChoiceGroup에 `answer_type: Evidence` 적용 |
| 05 | conditions 배열의 구 타입 → 신 타입으로 일괄 변환 |
| 06 | 레거시 필드 일괄 제거 |

---

## 완료 기준

아래 항목을 모두 통과해야 이번 작업이 완료된 것으로 본다.

- [ ] `validate_game_data.py` 전체 통과
- [ ] `node --check game/js/engine/*.js` 전체 통과
- [ ] 브라우저에서 ch1 전체 플레이 정상 동작
- [ ] 침식/신용 HUD가 게임 화면에 상시 표시됨
- [ ] 증거 제시 ChoiceGroup이 있는 씬에서 인벤토리 UI가 열림
- [ ] 세이브/불러오기 정상 동작
- [ ] EditorNode에서 새 테이블 항목 편집 가능
- [ ] 레거시 필드가 game_data.js에 존재하지 않음
- [ ] 브라우저 콘솔 에러 없음

---

## 참고 문서

| 문서 | 위치 |
|---|---|
| 테이블 명세 | `content/docs/system/core/TABLE_SPEC.md` |
| 데이터 구조 운영 | `content/docs/system/core/DATA_STRUCTURE.md` |
| 설계 원칙 | `content/docs/system/core/테이블_완전_새구조.md` |
| STEP 01 게이지 시스템 | `content/docs/system/core/impl/STEP_01_게이지시스템.md` |
| STEP 02 이펙트 시스템 | `content/docs/system/core/impl/STEP_02_이펙트시스템.md` |
| STEP 03 Choice 확장 | `content/docs/system/core/impl/STEP_03_초이스확장.md` |
| STEP 04 HUD 개편 | `content/docs/system/core/impl/STEP_04_HUD개편.md` |
| STEP 05 Condition 재정의 | `content/docs/system/core/impl/STEP_05_컨디션재정의.md` |
| STEP 06 레거시 제거 | `content/docs/system/core/impl/STEP_06_레거시제거.md` |
