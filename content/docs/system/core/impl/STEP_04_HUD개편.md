# STEP 04 — HUD 개편

## 목적

침식(Erosion)과 신용(Credibility) 수치를 수첩 밖에서도 상시 확인할 수 있도록 HUD를 개편한다.
플레이어가 자신의 상태를 직관적으로 인식하게 해 게이지 기반 긴장감을 실제로 체감할 수 있게 한다.

---

## 구현 범위

| 파일 | 작업 |
|---|---|
| `game/index.html` | HUD 게이지 영역 마크업 추가 |
| `game/css/` | HUD 게이지 스타일 추가 |
| `game/js/managers/ui.js` | `updateGaugeHUD(gaugeId, value, state)` 함수 추가 |
| `game/js/engine/state.js` | `change:gauge:{gaugeId}` 이벤트 emit 확인 (STEP 01에서 구현) |
| `game/js/core/engine.js` | 씬 로드 시 HUD 초기 렌더링 |

---

## HUD 레이아웃 명세

### 위치

- 화면 우측 상단 고정 (`position: fixed`)
- 대화 박스, 선택지 UI와 겹치지 않는 위치
- 수첩 패널이 열려있어도 항상 보인다

### 구성 요소

```
[ 게이지 이름 ]  [ 상태 라벨 ]
[ ██████░░░░ ]   숫자 (현재/최대)
```

- `hud_visible: true`인 게이지만 표시한다.
- `hud_order` 기준 오름차순으로 배치한다.
- 게이지 바 색상은 현재 GaugeState의 `hud_color`를 사용한다.

### 게이지 바 스펙

| 속성 | 내용 |
|---|---|
| 형태 | 가로 바 (width % = 현재값 / 최댓값 × 100) |
| 색상 | 현재 GaugeState의 `hud_color` |
| 전환 | 값 변경 시 CSS transition 0.4s ease |
| 상태 라벨 | 현재 GaugeState의 `label` 텍스트 |
| 수치 표시 | `현재값 / 최댓값` 형태 (숫자) |

### 상태 변화 연출

GaugeState가 바뀔 때 (예: 안정 → 전조):

1. 게이지 바 색상이 새 `hud_color`로 전환된다 (0.4s)
2. 상태 라벨이 새 `label`로 바뀐다
3. 토스트 메시지 표시: `"[게이지 라벨] 상태 변화: [이전 라벨] → [새 라벨]"`
4. 토스트 duration: 3초

### 경성뎐 HUD 표시 예시

```
침식   안정
[██░░░░░░░░]  2 / 10

신용   신뢰
[████████░░]  8 / 10
```

---

## 동작 정의

### 초기 렌더링

씬이 로드될 때 `hud_visible: true`인 게이지 전체를 렌더링한다.

```
Engine.data.gauges
  .filter(g => g.hud_visible)
  .sort((a, b) => a.hud_order - b.hud_order)
  .forEach(g => UIManager.renderGaugeHUD(g, State.getGauge(g.gauge_id)))
```

### 수치 변경 시 업데이트

`State.on('change:gauge:{gaugeId}', value => { ... })` 이벤트를 수신해 해당 게이지 HUD만 갱신한다.

### UIManager.renderGaugeHUD(gauge, currentValue)

```
1. gauge_id로 HUD 요소를 찾는다
2. 현재값으로 바 width % 계산
3. 현재 GaugeState 조회 (min_value ~ max_value 범위 매칭)
4. hud_color, label 반영
5. 숫자 표시 업데이트
```

### UIManager.updateGaugeHUD(gaugeId, value, prevState, nextState)

GaugeState가 바뀐 경우 전환 연출을 포함한다.

---

## 접근성 / UX 주의사항

- 게이지 수치가 낮아지는 방향(Erosion 증가, Credibility 감소)에서 색상이 붉어진다.
- 숫자를 보지 않아도 색상과 라벨로 위험도를 직관적으로 파악할 수 있어야 한다.
- 모바일 해상도에서 HUD가 대화 영역을 침범하지 않도록 한다.
- HUD는 타이틀 화면에서는 숨긴다. 씬이 시작되면 표시한다.

---

## 버전 관리

이 작업 완료 후 `game/index.html`에서 로드되는 CSS/JS 파일의 `?v=` 쿼리스트링을 갱신한다.

---

## 검증 기준

- [ ] 게임 화면에서 침식, 신용 게이지가 상시 표시된다.
- [ ] `State.addGauge('Erosion', 1)` 호출 시 HUD 게이지 바가 즉시 갱신된다.
- [ ] 게이지 바 색상이 GaugeState의 `hud_color`와 일치한다.
- [ ] GaugeState 전환 시 상태 라벨이 바뀌고 토스트가 표시된다.
- [ ] 타이틀 화면에서는 HUD가 보이지 않는다.
- [ ] 수첩 패널이 열려있어도 HUD가 보인다.
- [ ] 모바일(360px) 해상도에서 레이아웃이 깨지지 않는다.
- [ ] CSS/JS `?v=` 버전이 갱신됐다.
