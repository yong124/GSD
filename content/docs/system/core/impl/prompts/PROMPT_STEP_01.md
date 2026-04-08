# 코덱스 프롬프트 — STEP 01: 게이지 시스템

## 작업 전 필독

아래 문서를 순서대로 읽고 작업을 시작한다.

1. `content/docs/system/core/impl/IMPLEMENTATION_PLAN.md` — 전체 구현 계획
2. `content/docs/system/core/impl/STEP_01_게이지시스템.md` — 이번 작업 세부 명세
3. `content/docs/system/core/TABLE_SPEC.md` — GaugeTable, GaugeStateTable 명세 확인
4. `game/data/game_data.js` — 현재 데이터 구조 파악
5. `game/js/engine/state.js` — 현재 상태 관리 구조 파악

---

## 작업 지시

경성뎐 게임의 게이지 시스템을 구축한다.

현재 게임에는 `ResonanceLevel`, `InvestigationScore` 등의 수치가 코드에 하드코딩되어 있다. 이를 테이블 기반 구조로 전환한다.

### 해야 할 것

**1. game_data.js에 gauges, gauge_states 배열 추가**

명세에 정의된 경성뎐 초기 데이터를 그대로 삽입한다.
- `Erosion` (침식): 0~10, 기본값 0, HUD 표시
- `Credibility` (신용): 0~10, 기본값 10, HUD 표시
- 각 게이지의 단계(GaugeState)도 명세 그대로 삽입

**2. state.js에 게이지 API 추가**

```js
State.getGauge(gaugeId)        // 현재값 반환
State.setGauge(gaugeId, value) // 값 설정, min/max clamp 자동 처리
State.addGauge(gaugeId, delta) // 변화량 적용
```

- `setGauge` 호출 시 값이 변하면 `change:gauge:{gaugeId}` 이벤트 emit
- `addGauge` 후 GaugeState가 바뀌면 `gauge:state:{gaugeId}` 이벤트 emit
- serialize/deserialize에 `gauges` 맵 추가, fallback은 `default_value`

**3. scene.js에 TriggerScene 처리 추가**

- `gauge:state:{gaugeId}` 이벤트 수신
- 진입한 GaugeState의 `trigger_scene_id`가 null이 아니면 즉시 해당 씬으로 전환

**4. export_to_json.py 수정**

GaugeTable, GaugeStateTable 시트를 읽어 game_data의 `gauges`, `gauge_states` 배열로 변환하는 로직 추가

**5. validate_game_data.py 수정**

`gauges`, `gauge_states` 필수 컬럼 및 타입 검증 추가

**6. EditorNode 수정**

데이터 탭에 Gauge, GaugeState 항목 추가/수정/삭제 UI 추가

### 하지 말 것

- 기존 코드를 건드리지 않는다. 추가만 한다.
- HUD 시각화는 이번 단계에서 하지 않는다 (STEP 04).
- 레거시 필드 제거는 하지 않는다 (STEP 06).
- game_data.js의 기존 데이터를 변경하지 않는다.

---

## 완료 기준

아래 항목을 모두 확인하고 보고한다.

- [ ] `game_data.js`에 `gauges`, `gauge_states` 배열이 존재한다
- [ ] `State.getGauge('Erosion')`이 초기값 `0`을 반환한다
- [ ] `State.addGauge('Erosion', 10)` 호출 시 max인 `10`으로 고정된다
- [ ] Erosion이 `10`에 도달하면 `scene_gameover_erosion` 씬으로 전환된다
- [ ] Credibility가 `0`에 도달하면 `scene_gameover_credibility` 씬으로 전환된다
- [ ] 세이브/불러오기 후 게이지 값이 올바르게 복원된다
- [ ] `python content/tools/validate_game_data.py` 통과
- [ ] `node --check game/js/engine/state.js` 통과
- [ ] EditorNode에서 Gauge, GaugeState 편집 가능
