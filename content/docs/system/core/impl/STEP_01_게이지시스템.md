# STEP 01 — 게이지 시스템 구축

## 목적

게임 내 수치(침식, 신용 등)를 테이블 기반으로 관리한다.
기존에 하드코딩되어 있던 `ResonanceLevel`, `InvestigationScore` 등 수치 계열을 모두 `GaugeTable` 하나로 일원화한다.
이 단계가 완료되어야 이후 Effect, Condition, HUD 작업이 가능하다.

---

## 구현 범위

| 파일 | 작업 |
|---|---|
| `game/data/game_data.js` | `gauges`, `gauge_states` 배열 추가 |
| `game/js/engine/state.js` | 게이지 현재값 저장/조회/변경 API 추가 |
| `game/js/engine/scene.js` | GaugeState 진입 감지 및 TriggerScene 처리 |
| `content/tools/export_to_json.py` | GaugeTable, GaugeStateTable 시트 → game_data 변환 추가 |
| `content/tools/validate_game_data.py` | gauges, gauge_states 구조 검증 추가 |
| `EditorNode/editor.js` | 데이터 탭에 Gauge, GaugeState 편집 UI 추가 |

---

## 데이터 명세

### game_data.js 구조

```js
window.GAME_DATA = {
  // 기존 필드들...

  "gauges": [
    {
      "gauge_id": "Erosion",
      "label": "침식",
      "min_value": 0,
      "max_value": 10,
      "default_value": 0,
      "hud_visible": true,
      "hud_order": 1
    }
  ],

  "gauge_states": [
    {
      "gauge_id": "Erosion",
      "min_value": 0,
      "max_value": 2,
      "label": "안정",
      "hud_color": "#6a9f6a",
      "detail": "아직은 현실 감각이 우세한 상태입니다.",
      "trigger_scene_id": null
    }
  ]
}
```

### GaugeTable 컬럼

| 컬럼 | 타입 | 필수 |
|---|---|---|
| `gauge_id` | string | ✓ |
| `label` | string | ✓ |
| `min_value` | number | ✓ |
| `max_value` | number | ✓ |
| `default_value` | number | ✓ |
| `hud_visible` | boolean | ✓ |
| `hud_order` | number | ✓ |

### GaugeStateTable 컬럼

| 컬럼 | 타입 | 필수 |
|---|---|---|
| `gauge_id` | string | ✓ |
| `min_value` | number | ✓ |
| `max_value` | number | ✓ |
| `label` | string | ✓ |
| `hud_color` | string | ✓ |
| `detail` | string | ✓ |
| `trigger_scene_id` | string \| null | — |

---

## 경성뎐 초기 데이터

### gauges

| gauge_id | label | min | max | default | hud_visible | hud_order |
|---|---|---|---|---|---|---|
| `Erosion` | 침식 | 0 | 10 | 0 | true | 1 |
| `Credibility` | 신용 | 0 | 10 | 10 | true | 2 |

### gauge_states (Erosion)

| min | max | label | hud_color | detail | trigger_scene_id |
|---|---|---|---|---|---|
| 0 | 2 | 안정 | `#6a9f6a` | 아직은 현실 감각이 우세한 상태입니다. | null |
| 3 | 5 | 전조 | `#c8a84b` | 조사 과정 곳곳에서 의식의 낌새가 드러납니다. | null |
| 6 | 8 | 심화 | `#b06040` | 위험을 감수한 만큼 비현실의 결이 짙어졌습니다. | null |
| 9 | 9 | 침식 | `#8b2020` | 현실과 의식의 경계가 크게 흔들리고 있습니다. | null |
| 10 | 10 | 붕괴 | `#4a0000` | — | `scene_gameover_erosion` |

### gauge_states (Credibility)

| min | max | label | hud_color | detail | trigger_scene_id |
|---|---|---|---|---|---|
| 3 | 10 | 신뢰 | `#6a9f6a` | 기자로서의 발언에 무게가 실립니다. | null |
| 1 | 2 | 흔들림 | `#c8a84b` | 섣부른 판단이 신뢰를 갉아먹고 있습니다. | null |
| 0 | 0 | 실각 | `#8b2020` | — | `scene_gameover_credibility` |

---

## 동작 정의

### State.js — 게이지 API

```js
// 게이지 현재값 조회
State.getGauge(gaugeId)          // → number

// 게이지 현재값 변경
State.setGauge(gaugeId, value)   // clamp(min, max) 자동 처리

// 게이지 변화량 적용
State.addGauge(gaugeId, delta)   // setGauge(current + delta)
```

- `setGauge` 호출 시 값이 변하면 `change:gauge:{gaugeId}` 이벤트를 emit한다.
- `addGauge` 호출 후 새 값이 어떤 GaugeState의 범위에 진입하면 `gauge:state:{gaugeId}` 이벤트를 emit한다.

### scene.js — TriggerScene 처리

- `gauge:state:{gaugeId}` 이벤트를 수신한다.
- 진입한 GaugeState의 `trigger_scene_id`가 null이 아니면 해당 씬으로 즉시 전환한다.
- 씬 전환은 기존 `Scene.load(id)` 흐름을 그대로 사용한다.

### 직렬화 / 역직렬화

- `State.serialize()`에 `gauges: { [gaugeId]: number }` 맵 추가.
- `State.deserialize()`에서 복원 시 GaugeTable의 `default_value`로 fallback.

---

## 검증 기준

아래 항목이 모두 통과되어야 이 단계가 완료된 것으로 본다.

- [ ] `game_data.js`에 `gauges`, `gauge_states` 배열이 존재한다.
- [ ] `State.getGauge('Erosion')`이 초기값 `0`을 반환한다.
- [ ] `State.addGauge('Erosion', 10)` 호출 시 값이 max인 `10`으로 고정된다.
- [ ] Erosion이 `10`에 도달하면 `scene_gameover_erosion` 씬으로 전환된다.
- [ ] Credibility가 `0`에 도달하면 `scene_gameover_credibility` 씬으로 전환된다.
- [ ] 세이브/불러오기 후 게이지 값이 올바르게 복원된다.
- [ ] `validate_game_data.py` 통과.
- [ ] EditorNode에서 Gauge, GaugeState 항목을 추가/수정/삭제할 수 있다.
