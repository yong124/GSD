# 경성뎐 Node Editor 커밋 가이드

## 1. 목적

본 문서는 현재 변경 사항을 어떤 기준으로 커밋하면 좋은지 정리한 메모다.

---

## 2. 추천 커밋 묶음

### 커밋 1. Node Editor 기능 확장

대상:

- `EditorNode/index.html`
- `EditorNode/editor.css`
- `EditorNode/editor.js`

내용:

- 프리뷰
- 검수 기능
- 검색 / 필터
- 준대량 편집
- 시각화 고도화
- 기본 편집 안정화

추천 메시지:

```text
feat: expand Node Editor into main narrative workflow tool
```

### 커밋 2. content 구조 정리 및 도구 경로 정리

대상:

- `content/README.md`
- `content/data/*`
- `content/generated/*`
- `content/tools/*`
- `content/tools/legacy/*`
- `content/docs/**/*`
- `CLAUDE.md`
- `NEXT_STEPS.md`
- `game/js/main.js`

내용:

- content 폴더 재구성
- 문서 분류
- 변환 스크립트 이동
- 경로 안내 수정

추천 메시지:

```text
chore: reorganize content pipeline files and documentation
```

### 커밋 3. 런타임 데이터 재생성

대상:

- `game/data/game_data.js`

내용:

- 최신 `content/data/script.xlsx` 기준으로 재생성된 런타임 데이터

추천 메시지:

```text
chore: regenerate runtime narrative data
```

---

## 3. 주의 사항

- `game_data.js`는 생성 파일이므로, 가능하면 별도 커밋으로 분리하는 편이 diff 확인에 좋다.
- generated 산출물은 필요할 때만 포함한다.
- `tools/legacy`는 보관 목적이므로 삭제 커밋과 섞지 않는 편이 보기 쉽다.

---

## 4. 한 줄 정리

추천 커밋 순서는 `에디터 기능 -> content 구조 정리 -> game_data 재생성`이다.
