// ============================================================
//  경성뎐 시스템 기획 포트폴리오  –  v3 리디자인
//  디자인 톤: 에디토리얼 / 아카이브 / 문서 편집 디자인
//  배경: 아이보리  |  강조: 딥 레드  |  보조: 먹색·금색
// ============================================================
"use strict";

const path = require("path");
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" × 5.625"

// ─── 1. 디자인 토큰 ─────────────────────────────────────────
const C = {
  bgIvory:    "F5F0E6",   // 슬라이드 기본 배경 (아이보리)
  bgCover:    "1C1510",   // 표지 배경 (짙은 먹색)
  bgDark:     "2A2018",   // 다크 액센트 배경
  cardBg:     "EAE3D3",   // 카드 배경
  cardBgAlt:  "F0EBE0",   // 카드 배경 (연하게)
  cardBgDark: "DED5C2",   // 카드 배경 (조금 더 어둡게)
  ink:        "2A2018",   // 기본 텍스트 (먹색)
  sub:        "5C4A38",   // 부제목·설명 텍스트
  muted:      "8A7A6A",   // 약한 텍스트
  red:        "8C1F1F",   // 강조 딥레드
  redLight:   "A83030",   // 약간 연한 레드
  gold:       "9A7B35",   // 금색 보조
  goldLight:  "B8964A",   // 연한 금색
  border:     "C8BAA8",   // 구분선
  ivory:      "FAF8F4",   // 거의 흰색
  white:      "FFFFFF",
  coverText:  "F0EBE0",   // 표지 본문 텍스트
};
const F = { serif: "Georgia", sans: "Calibri" };

// ─── 2. 헬퍼 함수 ───────────────────────────────────────────

/** 슬라이드 헤더: 번호 + 섹션 라벨 + 구분선 */
function hdr(sl, num, label) {
  sl.addText(`${String(num).padStart(2, "0")}`, {
    x: 0.55, y: 0.32, w: 0.5, h: 0.28,
    fontSize: 10, fontFace: F.sans, bold: true,
    color: C.gold, align: "left", charSpacing: 2, margin: 0,
  });
  sl.addText(label.toUpperCase(), {
    x: 1.0, y: 0.32, w: 7.5, h: 0.28,
    fontSize: 9, fontFace: F.sans, bold: true,
    color: C.red, align: "left", charSpacing: 3, margin: 0,
  });
  sl.addShape(pres.shapes.LINE, {
    x: 0.55, y: 0.65, w: 8.9, h: 0,
    line: { color: C.border, width: 0.75 },
  });
}

/** 슬라이드 푸터: 프로젝트명 + 페이지번호 */
function ftr(sl, num) {
  sl.addShape(pres.shapes.LINE, {
    x: 0.55, y: 5.27, w: 8.9, h: 0,
    line: { color: C.border, width: 0.5 },
  });
  sl.addText("경성뎐 시스템 기획 포트폴리오", {
    x: 0.55, y: 5.3, w: 7, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: C.muted, align: "left", margin: 0,
  });
  sl.addText(String(num).padStart(2, "0"), {
    x: 8.8, y: 5.3, w: 0.65, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: C.muted, align: "right", margin: 0,
  });
}

/** 왼쪽 레드 바 있는 카드 박스 */
function card(sl, x, y, w, h, bgColor, barColor) {
  const bc = barColor || C.red;
  sl.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: bgColor || C.cardBg }, line: { color: bgColor || C.cardBg },
  });
  sl.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.065, h, fill: { color: bc }, line: { color: bc },
  });
}

/** 단순 박스 (바 없음) */
function box(sl, x, y, w, h, bgColor, lineColor) {
  sl.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: bgColor || C.cardBg },
    line: { color: lineColor || (bgColor || C.cardBg) },
  });
}

/** 흐름도 화살표 */
function arrow(sl, x, y, w) {
  sl.addShape(pres.shapes.LINE, {
    x, y, w, h: 0, line: { color: C.border, width: 1.5 },
  });
  // 화살촉 (작은 삼각형으로 표현)
  sl.addText("▶", {
    x: x + w - 0.05, y: y - 0.1, w: 0.2, h: 0.2,
    fontSize: 8, fontFace: F.sans, color: C.border, align: "center", margin: 0,
  });
}

/** 이미지 추가 (절대경로) */
const SHOTS = "G:/GSD/content/docs/portfolio/screenshots/";
function img(sl, file, x, y, w, h) {
  sl.addImage({ path: SHOTS + file, x, y, w, h });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 1 — COVER (표지)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgCover };

  // 좌측 레드 수직 강조 바
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 0.6, w: 0.07, h: 4.4,
    fill: { color: C.red }, line: { color: C.red },
  });

  // 상단 라벨
  sl.addText("SYSTEM DESIGN PORTFOLIO", {
    x: 0.8, y: 0.62, w: 8.5, h: 0.28,
    fontSize: 9.5, fontFace: F.sans, bold: true,
    color: C.gold, align: "left", charSpacing: 5, margin: 0,
  });

  // 메인 타이틀
  sl.addText("경성뎐", {
    x: 0.8, y: 1.0, w: 8.5, h: 1.1,
    fontSize: 62, fontFace: F.serif, bold: true,
    color: C.ivory, align: "left", margin: 0,
  });

  // 서브타이틀
  sl.addText("시스템 기획 포트폴리오", {
    x: 0.82, y: 1.95, w: 8.5, h: 0.55,
    fontSize: 22, fontFace: F.serif, bold: false,
    color: C.coverText, align: "left", margin: 0,
  });

  // 구분선
  sl.addShape(pres.shapes.LINE, {
    x: 0.8, y: 2.6, w: 5.5, h: 0,
    line: { color: C.red, width: 1 },
  });

  // 프로젝트 설명
  sl.addText(
    "1930년대 경성 배경 탐정 ADV  ·  솔로 개발 프로젝트",
    {
      x: 0.8, y: 2.75, w: 8.5, h: 0.3,
      fontSize: 12, fontFace: F.sans, color: C.muted,
      align: "left", italic: true, margin: 0,
    }
  );

  // 태그 목록
  const tags = [
    "데이터 중심 설계",
    "씬 구조화",
    "조건 분기 시스템",
    "Condition 중심 분기",
    "에디터 설계",
    "자동화 파이프라인",
  ];
  sl.addText(tags.join("   /   "), {
    x: 0.8, y: 3.15, w: 8.5, h: 0.3,
    fontSize: 10, fontFace: F.sans, color: C.sub,
    align: "left", charSpacing: 0.5, margin: 0,
  });

  // 한 줄 포지셔닝
  sl.addText(
    "단순한 내러티브 게임이 아니라, 반복 작업이 가능하고 확장 가능한 시스템 설계 프로젝트",
    {
      x: 0.8, y: 3.65, w: 8.1, h: 0.55,
      fontSize: 12.5, fontFace: F.serif, italic: true,
      color: C.coverText, align: "left", margin: 0,
    }
  );

  // 하단 - 제작자 정보
  sl.addShape(pres.shapes.LINE, {
    x: 0.55, y: 5.08, w: 8.9, h: 0,
    line: { color: "3A2E24", width: 0.75 },
  });
  sl.addText("게임 시스템 기획 포트폴리오  ·  솔로 개발 1인 프로젝트", {
    x: 0.8, y: 5.15, w: 8.5, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: "4A3E32",
    align: "left", margin: 0,
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 2 — PROJECT OVERVIEW (프로젝트 개요)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 2, "Project Overview · 프로젝트 개요");
  ftr(sl, 2);

  // 타이틀
  sl.addText("경성뎐은 어떤 프로젝트인가", {
    x: 0.55, y: 0.78, w: 9, h: 0.5,
    fontSize: 26, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  // 부제
  sl.addText(
    "1930년대 경성 배경 탐정 ADV  ·  하드코딩 데이터베이스화부터 전체 편집 시스템 설계까지",
    {
      x: 0.55, y: 1.32, w: 9, h: 0.28,
      fontSize: 11.5, fontFace: F.sans, italic: true,
      color: C.sub, align: "left", margin: 0,
    }
  );

  // ── 게임 스크린샷 (우측) ──
  img(sl, "game_title.png", 5.6, 1.7, 4.05, 2.28);
  // 캡션
  sl.addText("게임 타이틀 화면 · Chapter 1", {
    x: 5.6, y: 4.0, w: 4.05, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: C.muted, align: "center", margin: 0,
  });

  // ── 단계별 타임라인 (좌측) ──
  const phases = [
    {
      num: "01",
      label: "Phase 1",
      title: "데이터베이스화",
      desc: "씬·대사 하드코딩 → script.xlsx 분리\n작성·읽기를 코드 없이 가능하게. 플레이 흐름 확인 우선.",
    },
    {
      num: "02",
      label: "Phase 2",
      title: "에디터 설계",
      desc: "script.xlsx ↔ game_data.js 변환 파이프라인 구축\n데이터 코드 분리. EditorNode 개발 착수.",
    },
    {
      num: "03",
      label: "Phase 3",
      title: "조건 고도화",
      desc: "Condition 중심 분기 설계 + 자동화 검증 흐름\nFK/Enum 검증 UI, 이미지 이름 자동완성, 에러 리포트.",
    },
  ];

  let py = 1.68;
  phases.forEach((p) => {
    // 번호 원
    sl.addShape(pres.shapes.OVAL, {
      x: 0.55, y: py + 0.09, w: 0.4, h: 0.4,
      fill: { color: C.red }, line: { color: C.red },
    });
    sl.addText(p.num, {
      x: 0.55, y: py + 0.09, w: 0.4, h: 0.4,
      fontSize: 9, fontFace: F.sans, bold: true,
      color: C.ivory, align: "center", valign: "middle", margin: 0,
    });
    // 연결선 (첫 번째 제외)
    if (py > 1.7) {
      // 이미 그림
    }
    // 카드
    card(sl, 1.1, py, 4.3, 0.78, C.cardBg);
    sl.addText(`${p.label}  ·  ${p.title}`, {
      x: 1.25, y: py + 0.07, w: 4.0, h: 0.28,
      fontSize: 11.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    sl.addText(p.desc, {
      x: 1.25, y: py + 0.37, w: 3.9, h: 0.34,
      fontSize: 9.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
    py += 0.92;
  });

  // 수직 연결선
  sl.addShape(pres.shapes.LINE, {
    x: 0.745, y: 2.12, w: 0, h: 1.82,
    line: { color: C.border, width: 1.5 },
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 3 — PROBLEM DEFINITION (문제 정의)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 3, "Problem Definition · 무엇이 문제였나");
  ftr(sl, 3);

  sl.addText("초기 구조의 네 가지 한계", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 24, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "처음에는 ADV 제작에 하드코딩 방식도 충분해 보였다. 그러나 씬이 늘어나면서 문제가 구조적으로 드러나기 시작했다.",
    {
      x: 0.55, y: 1.27, w: 9, h: 0.28,
      fontSize: 11, fontFace: F.sans, italic: true,
      color: C.sub, align: "left", margin: 0,
    }
  );

  // BEFORE 라벨
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 1.62, w: 1.1, h: 0.3,
    fill: { color: C.red }, line: { color: C.red },
  });
  sl.addText("BEFORE", {
    x: 0.55, y: 1.62, w: 1.1, h: 0.3,
    fontSize: 9, fontFace: F.sans, bold: true,
    color: C.ivory, align: "center", valign: "middle", charSpacing: 2, margin: 0,
  });
  sl.addText("초기 하드코딩 방식의 구조적 한계", {
    x: 1.75, y: 1.64, w: 7, h: 0.26,
    fontSize: 10, fontFace: F.sans, color: C.sub,
    align: "left", margin: 0,
  });

  // 4개 문제 카드
  const problems = [
    {
      num: "01",
      title: "씬·대사 직접 코드 작성",
      items: ["스토리 작성 = 코드 작성", "기획자의 작업 속도·자율성이 낮음"],
    },
    {
      num: "02",
      title: "씬 구조 파악 불가",
      items: ["씬 흐름이 코드 안에 숨어 있음", "전체 분기 흐름의 한눈에 파악 불가"],
    },
    {
      num: "03",
      title: "분기 플래그 규칙 없음",
      items: ["분기 규칙 없어 불명확한 반복 오류", "작업자 바뀌면 흐름 파악 불가"],
    },
    {
      num: "04",
      title: "협업·확장이 구조적으로 불가",
      items: ["기획 의도를 코드에서만 확인 가능", "새 씬 추가 시 충돌 위험 상존"],
    },
  ];

  const cols = [0.55, 5.05];
  const rows = [1.98, 3.38];
  problems.forEach((p, i) => {
    const x = cols[i % 2];
    const y = rows[Math.floor(i / 2)];
    card(sl, x, y, 4.3, 1.22, C.cardBg);
    // 번호
    sl.addText(p.num, {
      x: x + 0.12, y: y + 0.1, w: 0.5, h: 0.32,
      fontSize: 18, fontFace: F.serif, bold: true,
      color: C.red, align: "left", margin: 0,
    });
    // 제목
    sl.addText(p.title, {
      x: x + 0.62, y: y + 0.1, w: 3.55, h: 0.32,
      fontSize: 12.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    // 구분선
    sl.addShape(pres.shapes.LINE, {
      x: x + 0.15, y: y + 0.48, w: 3.95, h: 0,
      line: { color: C.border, width: 0.5 },
    });
    // 설명
    p.items.forEach((item, ii) => {
      sl.addText(item, {
        x: x + 0.15, y: y + 0.55 + ii * 0.3,
        w: 3.95, h: 0.28,
        fontSize: 10.5, fontFace: F.sans, color: C.sub,
        align: "left", margin: 0,
      });
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 4 — PLANNING GOALS (기획 목표)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 4, "Planning Goals · 무엇을 해결하려 했나");
  ftr(sl, 4);

  sl.addText("네 가지 핵심 설계 목표", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 24, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "단순히 기능을 추가하는 작업이 아니었다. 기획자가 코드에서 분리되어 반복·확장 가능한 구조를 스스로 운영할 수 있도록 설계해야 했다.",
    {
      x: 0.55, y: 1.27, w: 9, h: 0.28,
      fontSize: 11, fontFace: F.sans, italic: true,
      color: C.sub, align: "left", margin: 0,
    }
  );

  const goals = [
    {
      num: "01",
      label: "데이터 구조화",
      title: "기획 데이터를 코드 밖으로",
      desc: "script.xlsx ↔ game_data.js 파이프라인으로 기획자의 데이터 분리. 씬·대사 직접 편집 가능.",
    },
    {
      num: "02",
      label: "시스템 설계",
      title: "조건 분기의 체계화",
      desc: "Flag/Rule 방식 → Condition 중심으로 전환. 상태·신뢰도·분기를 구조적으로 분류.",
    },
    {
      num: "03",
      label: "시각화",
      title: "씬 흐름을 한눈에",
      desc: "씬 그래프로 분기 흐름 시각 확인. EditorNode로 전체 구조를 한 화면에 파악 가능.",
    },
    {
      num: "04",
      label: "자동화",
      title: "오류 방지 흐름 설계",
      desc: "데이터 변환·검증 자동화. FK/Enum 검증 UI + 이미지 이름 자동완성 + 오류 보고 흐름.",
    },
  ];

  const gx = [0.55, 5.05];
  const gy = [1.7, 3.3];
  goals.forEach((g, i) => {
    const x = gx[i % 2];
    const y = gy[Math.floor(i / 2)];
    card(sl, x, y, 4.3, 1.35, C.cardBg);

    // 번호 원
    sl.addShape(pres.shapes.OVAL, {
      x: x + 0.12, y: y + 0.15, w: 0.44, h: 0.44,
      fill: { color: C.red }, line: { color: C.red },
    });
    sl.addText(g.num, {
      x: x + 0.12, y: y + 0.15, w: 0.44, h: 0.44,
      fontSize: 9.5, fontFace: F.sans, bold: true,
      color: C.ivory, align: "center", valign: "middle", margin: 0,
    });

    // 라벨 태그
    sl.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.65, y: y + 0.18, w: 1.1, h: 0.22,
      fill: { color: C.cardBgDark }, line: { color: C.cardBgDark },
    });
    sl.addText(g.label, {
      x: x + 0.65, y: y + 0.18, w: 1.1, h: 0.22,
      fontSize: 8, fontFace: F.sans, bold: true,
      color: C.red, align: "center", valign: "middle", charSpacing: 1, margin: 0,
    });

    // 제목
    sl.addText(g.title, {
      x: x + 0.12, y: y + 0.65, w: 3.95, h: 0.3,
      fontSize: 13, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    // 설명
    sl.addText(g.desc, {
      x: x + 0.12, y: y + 0.96, w: 3.95, h: 0.35,
      fontSize: 9.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 5 — SYSTEM STRUCTURE (시스템 구조 설계)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 5, "System Structure · 시스템 구조 설계");
  ftr(sl, 5);

  sl.addText("플레이어 입력 → Condition 분기 → 결말까지의 흐름", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "전체 게임 데이터 흐름을 Effect·Condition·State 중심으로 재설계했다.",
    {
      x: 0.55, y: 1.27, w: 9, h: 0.25,
      fontSize: 10.5, fontFace: F.sans, italic: true, color: C.sub,
      align: "left", margin: 0,
    }
  );

  // ── 흐름도 박스들 ──
  // 박스 레이아웃: 두 줄로 배치
  // 1열: 플레이어 선택 → 2열: Effect Group → 3열: Condition 분기 → 4열: State 변화
  // 2행: Branch 결정 → 씬 이동 → 결말

  const flowItems = [
    { x: 0.3,  y: 1.65, w: 2.1, h: 0.72, title: "플레이어 선택", desc: "일반 선택지\n조사 선택지\n증거 제시", color: C.cardBg },
    { x: 2.8,  y: 1.65, w: 2.1, h: 0.72, title: "Effect Group", desc: "GaugeChange\nEvidenceGive\nStateSet", color: C.cardBg },
    { x: 5.3,  y: 1.65, w: 2.1, h: 0.72, title: "Condition 분기", desc: "ChoiceSelected\nEvidenceOwned\nStateValue", color: C.cardBg },
    { x: 7.8,  y: 1.65, w: 1.85, h: 0.72, title: "State 변화", desc: "Erosion\nCredibility\nStateValue", color: C.cardBg },
  ];

  const flowItems2 = [
    { x: 0.3,  y: 3.05, w: 2.1, h: 0.72, title: "Branch 결정", desc: "ConditionGroup 확인\n→ 씬 분기", color: C.cardBgAlt },
    { x: 2.8,  y: 3.05, w: 2.1, h: 0.72, title: "씬 이동", desc: "next_type + next_id\nScene / Dialogue", color: C.cardBgAlt },
    { x: 5.3,  y: 3.05, w: 2.1, h: 0.72, title: "우선순위 조사", desc: "priority_budget\n조사 씬 반복", color: C.cardBgAlt },
    { x: 7.8,  y: 3.05, w: 1.85, h: 0.72, title: "결말 판정", desc: "Ending A·B·C\n/ Game Over", color: C.cardBg },
  ];

  // 1열 카드
  flowItems.forEach((fi, i) => {
    card(sl, fi.x, fi.y, fi.w, fi.h, fi.color);
    sl.addText(fi.title, {
      x: fi.x + 0.12, y: fi.y + 0.08, w: fi.w - 0.15, h: 0.26,
      fontSize: 10.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    sl.addText(fi.desc, {
      x: fi.x + 0.12, y: fi.y + 0.36, w: fi.w - 0.15, h: 0.34,
      fontSize: 8.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
    // 화살표 (마지막 제외)
    if (i < flowItems.length - 1) {
      sl.addText("→", {
        x: fi.x + fi.w + 0.02, y: fi.y + 0.25,
        w: 0.35, h: 0.25,
        fontSize: 13, fontFace: F.sans, color: C.red,
        align: "center", margin: 0,
      });
    }
  });

  // 2열 카드
  flowItems2.forEach((fi, i) => {
    card(sl, fi.x, fi.y, fi.w, fi.h, fi.color);
    sl.addText(fi.title, {
      x: fi.x + 0.12, y: fi.y + 0.08, w: fi.w - 0.15, h: 0.26,
      fontSize: 10.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    sl.addText(fi.desc, {
      x: fi.x + 0.12, y: fi.y + 0.36, w: fi.w - 0.15, h: 0.34,
      fontSize: 8.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
    if (i < flowItems2.length - 1) {
      sl.addText("→", {
        x: fi.x + fi.w + 0.02, y: fi.y + 0.25,
        w: 0.35, h: 0.25,
        fontSize: 13, fontFace: F.sans, color: C.red,
        align: "center", margin: 0,
      });
    }
  });

  // 1열→2열 수직 연결선
  sl.addShape(pres.shapes.LINE, {
    x: 1.35, y: 2.37, w: 0, h: 0.68,
    line: { color: C.border, width: 1.2 },
  });
  sl.addText("↓", {
    x: 1.22, y: 2.72, w: 0.28, h: 0.2,
    fontSize: 11, fontFace: F.sans, color: C.border, align: "center", margin: 0,
  });

  // 하단 설명 라벨
  sl.addShape(pres.shapes.LINE, {
    x: 0.3, y: 3.88, w: 9.35, h: 0,
    line: { color: C.border, width: 0.5 },
  });
  sl.addText(
    "모든 선택·분기·상태 변화가 Effect → Condition → State → Branch 한 흐름 안에서 연결된다",
    {
      x: 0.3, y: 3.93, w: 9.35, h: 0.28,
      fontSize: 10, fontFace: F.sans, italic: true, color: C.muted,
      align: "center", margin: 0,
    }
  );
}


// ════════════════════════════════════════════════════════════
//  SLIDE 6 — DATA STRUCTURE (데이터 구조 설계)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 6, "Data Structure · 데이터 구조를 어떻게 바꿨나");
  ftr(sl, 6);

  sl.addText("Flag → Condition 중심 구조로의 전환", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "초기 구조의 Flag·Rule 방식이 갖던 의미 손실과 불명확성을 Condition 중심 테이블 구조로 해결했다.",
    {
      x: 0.55, y: 1.27, w: 9, h: 0.25,
      fontSize: 10.5, fontFace: F.sans, italic: true, color: C.sub,
      align: "left", margin: 0,
    }
  );

  // ── Before 컬럼 ──
  box(sl, 0.35, 1.62, 4.4, 3.35, "E8E0CF");
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 1.62, w: 4.4, h: 0.38,
    fill: { color: "C4B8A0" }, line: { color: "C4B8A0" },
  });
  sl.addText("BEFORE  ·  Flag/Rule 방식", {
    x: 0.35, y: 1.62, w: 4.4, h: 0.38,
    fontSize: 11, fontFace: F.sans, bold: true,
    color: C.ink, align: "center", valign: "middle", margin: 0,
  });

  const beforeItems = [
    { label: "분기 조건",    prob: "flag_key + flag_value 문자열 조합\n→ 코드 안에 하드코딩, 의미 불명확" },
    { label: "씬 이동",      prob: "next_scene 단일 필드\n→ 씬 이동만 가능, Dialogue 점프 불가" },
    { label: "증거 조건",    prob: "extra_flags 커스텀 키 남용\n→ 분기 의도 파악 불가, 오류 추적 어려움" },
    { label: "신뢰·상태",    prob: "단일 플래그로 분산 처리\n→ 캐릭터별 관계 타입 구분 불가" },
  ];

  beforeItems.forEach((item, i) => {
    const y = 2.1 + i * 0.72;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 4.1, h: 0.62,
      fill: { color: "F5EEE2" }, line: { color: "D4C8B2" },
    });
    sl.addText(item.label, {
      x: 0.6, y: y + 0.04, w: 1.4, h: 0.22,
      fontSize: 9.5, fontFace: F.sans, bold: true,
      color: C.red, align: "left", margin: 0,
    });
    sl.addText(item.prob, {
      x: 0.6, y: y + 0.28, w: 3.85, h: 0.32,
      fontSize: 8.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
  });

  // 중앙 화살표
  sl.addText("→", {
    x: 4.78, y: 2.9, w: 0.45, h: 0.4,
    fontSize: 20, fontFace: F.sans, bold: true,
    color: C.red, align: "center", valign: "middle", margin: 0,
  });

  // ── After 컬럼 ──
  box(sl, 5.25, 1.62, 4.4, 3.35, C.cardBg);
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.25, y: 1.62, w: 4.4, h: 0.38,
    fill: { color: C.red }, line: { color: C.red },
  });
  sl.addText("AFTER  ·  Condition 중심 구조", {
    x: 5.25, y: 1.62, w: 4.4, h: 0.38,
    fontSize: 11, fontFace: F.sans, bold: true,
    color: C.ivory, align: "center", valign: "middle", margin: 0,
  });

  const afterItems = [
    { label: "분기 조건",  sol: "ConditionGroup 테이블\n→ 타입별 체계적 분기 조건 관리" },
    { label: "씬 이동",    sol: "next_type + next_id 분리\n→ Scene / Dialogue 두 방향 이동 지원" },
    { label: "증거 조건",  sol: "EvidenceOwned 타입 명시\n→ 인벤토리 보유 여부 정확 체크" },
    { label: "신뢰·상태",  sol: "StateValue + Trust(캐릭터ID)\n→ 캐릭터별 관계 타입 분리 관리" },
  ];

  afterItems.forEach((item, i) => {
    const y = 2.1 + i * 0.72;
    card(sl, 5.4, y, 4.1, 0.62, C.cardBgAlt);
    sl.addText(item.label, {
      x: 5.57, y: y + 0.04, w: 1.4, h: 0.22,
      fontSize: 9.5, fontFace: F.sans, bold: true,
      color: C.red, align: "left", margin: 0,
    });
    sl.addText(item.sol, {
      x: 5.57, y: y + 0.28, w: 3.85, h: 0.32,
      fontSize: 8.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 7 — EDITOR DESIGN (에디터 설계)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 7, "Editor Design · EditorNode 설계");
  ftr(sl, 7);

  sl.addText("기획자가 코드 없이 씬을 편집하는 환경", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  // 에디터 스크린샷 (좌측 큰 영역)
  img(sl, "editor_full.png", 0.35, 1.3, 5.5, 3.1);
  // 캡션
  sl.addText("EditorNode 전체 화면", {
    x: 0.35, y: 4.42, w: 5.5, h: 0.2,
    fontSize: 8.5, fontFace: F.sans, color: C.muted, align: "center", margin: 0,
  });

  // 우측 기능 목록
  const features = [
    { icon: "◆", title: "씬 그래프 시각화", desc: "분기 흐름을 노드 그래프로 한눈에" },
    { icon: "◆", title: "FK / Enum 검증 UI", desc: "잘못된 씬 ID, 이미지 이름 즉시 감지" },
    { icon: "◆", title: "이미지 자동완성", desc: "portrait·bg 경로 직접 타이핑 없음" },
    { icon: "◆", title: "미니맵 + 검색", desc: "씬 수 많아도 전체 구조 탐색 가능" },
    { icon: "◆", title: "데이터 패널 분리", desc: "씬 메타 / 대사 / 선택지 탭별 편집" },
  ];

  features.forEach((f, i) => {
    const y = 1.3 + i * 0.62;
    sl.addText(f.icon, {
      x: 6.05, y: y + 0.08, w: 0.25, h: 0.25,
      fontSize: 8, fontFace: F.sans, color: C.red, align: "center", margin: 0,
    });
    sl.addText(f.title, {
      x: 6.3, y: y + 0.06, w: 3.2, h: 0.24,
      fontSize: 11.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    sl.addText(f.desc, {
      x: 6.3, y: y + 0.3, w: 3.2, h: 0.22,
      fontSize: 9.5, fontFace: F.sans, color: C.sub, align: "left", margin: 0,
    });
    if (i < features.length - 1) {
      sl.addShape(pres.shapes.LINE, {
        x: 6.05, y: y + 0.57, w: 3.5, h: 0,
        line: { color: C.border, width: 0.5 },
      });
    }
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 8 — PIPELINE & VALIDATION (파이프라인 설계)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 8, "Pipeline & Validation · 데이터 흐름과 검증");
  ftr(sl, 8);

  sl.addText("편집 → 변환 → 검증 → 반영의 자동화 흐름", {
    x: 0.55, y: 0.78, w: 9, h: 0.45,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "데이터는 EditorNode에서 시작해 게임에 반영되기까지 검증 단계를 거치도록 설계했다.",
    {
      x: 0.55, y: 1.27, w: 9, h: 0.25,
      fontSize: 10.5, fontFace: F.sans, italic: true, color: C.sub,
      align: "left", margin: 0,
    }
  );

  // 파이프라인 흐름도 (5단계)
  const steps = [
    {
      id: "01",
      name: "EditorNode",
      sub: "씬·대사 편집\n조건 설정",
      color: C.red,
      textColor: C.ivory,
    },
    {
      id: "02",
      name: "export_to_json",
      sub: "xlsx →\ngame_data.js",
      color: C.cardBgDark,
      textColor: C.ink,
    },
    {
      id: "03",
      name: "validate",
      sub: "FK·Enum\n유효성 검사",
      color: C.cardBgDark,
      textColor: C.ink,
    },
    {
      id: "04",
      name: "game_data.js",
      sub: "런타임에\n반영",
      color: C.cardBg,
      textColor: C.ink,
    },
    {
      id: "05",
      name: "generated.xlsx",
      sub: "역방향 검수·\n공유용 산출물",
      color: C.cardBg,
      textColor: C.ink,
    },
  ];

  const sw = 1.55, sh = 1.0, sy = 1.75;
  steps.forEach((st, i) => {
    const sx = 0.3 + i * (sw + 0.42);
    box(sl, sx, sy, sw, sh, st.color, st.color);
    // 번호
    sl.addText(st.id, {
      x: sx + 0.07, y: sy + 0.06, w: 0.3, h: 0.22,
      fontSize: 8.5, fontFace: F.sans, bold: true,
      color: st.textColor === C.ivory ? "FFFFFF" : C.gold,
      align: "left", margin: 0, charSpacing: 1,
    });
    sl.addText(st.name, {
      x: sx + 0.08, y: sy + 0.28, w: sw - 0.12, h: 0.28,
      fontSize: 11, fontFace: F.sans, bold: true,
      color: st.textColor, align: "left", margin: 0,
    });
    sl.addText(st.sub, {
      x: sx + 0.08, y: sy + 0.58, w: sw - 0.12, h: 0.38,
      fontSize: 8.5, fontFace: F.sans,
      color: st.textColor === C.ivory ? "F0EBE0" : C.sub,
      align: "left", margin: 0,
    });
    // 화살표
    if (i < steps.length - 1) {
      sl.addText("→", {
        x: sx + sw + 0.03, y: sy + 0.35, w: 0.38, h: 0.3,
        fontSize: 14, fontFace: F.sans, color: C.red,
        align: "center", margin: 0,
      });
    }
  });

  // 아래 기능 카드 4개
  const feats = [
    { title: "FK / Enum 검증",     desc: "씬·캐릭터·이모션 ID 유효성 자동 체크. 잘못된 참조 즉시 감지." },
    { title: "이미지 이름 검증",   desc: "portrait·bg 경로 존재 여부 확인. 누락 파일 사전 경고." },
    { title: "고아 씬 탐지",       desc: "참조되지 않는 씬 ID 자동 탐지. 데드엔드 사전 제거." },
    { title: "validate 스크립트",  desc: "validate_game_data.py 자동 실행. 릴리즈 전 일괄 검증." },
  ];

  feats.forEach((f, i) => {
    const fx = 0.35 + i * 2.45;
    card(sl, fx, 3.0, 2.25, 1.0, C.cardBgAlt);
    sl.addText(f.title, {
      x: fx + 0.12, y: 3.05, w: 2.0, h: 0.26,
      fontSize: 10.5, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    sl.addText(f.desc, {
      x: fx + 0.12, y: 3.33, w: 2.0, h: 0.6,
      fontSize: 9, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 9 — BEFORE / AFTER (비교)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 9, "Before / After · 설계 전후 비교");
  ftr(sl, 9);

  sl.addText("시스템 설계 이전과 이후", {
    x: 0.55, y: 0.78, w: 9, h: 0.42,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  // 헤더 라벨
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 2.55, y: 1.28, w: 2.6, h: 0.3,
    fill: { color: "C4B8A0" }, line: { color: "C4B8A0" },
  });
  sl.addText("BEFORE", {
    x: 2.55, y: 1.28, w: 2.6, h: 0.3,
    fontSize: 10, fontFace: F.sans, bold: true,
    color: C.ink, align: "center", valign: "middle", charSpacing: 3, margin: 0,
  });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: 1.28, w: 2.6, h: 0.3,
    fill: { color: C.red }, line: { color: C.red },
  });
  sl.addText("AFTER", {
    x: 6.0, y: 1.28, w: 2.6, h: 0.3,
    fontSize: 10, fontFace: F.sans, bold: true,
    color: C.ivory, align: "center", valign: "middle", charSpacing: 3, margin: 0,
  });

  const comparisons = [
    {
      area: "데이터 작성",
      before: "코드 직접 작성 필요\n비개발자 작업 불가",
      after: "xlsx 편집 + EditorNode\n기획자 단독 작업 가능",
    },
    {
      area: "분기 파악",
      before: "코드 내부에 숨어 있음\n전체 흐름 파악 불가",
      after: "씬 그래프로 시각화\n분기 구조 한눈에 확인",
    },
    {
      area: "오류 탐지",
      before: "플레이 중 우연히 발견\n수동 코드 검색 필요",
      after: "validate 스크립트 자동 탐지\nFK·Enum·고아씬 즉시 감지",
    },
    {
      area: "확장성",
      before: "씬 추가 시 충돌 위험\n코드 없이 확장 불가",
      after: "데이터 추가로 씬 확장\n구조적 확장 흐름 완성",
    },
  ];

  comparisons.forEach((c, i) => {
    const y = 1.65 + i * 0.82;
    // 구분 라벨
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 0.35, y, w: 2.1, h: 0.66,
      fill: { color: C.bgDark }, line: { color: C.bgDark },
    });
    sl.addText(c.area, {
      x: 0.35, y, w: 2.1, h: 0.66,
      fontSize: 11.5, fontFace: F.sans, bold: true,
      color: C.gold, align: "center", valign: "middle", margin: 0,
    });
    // Before
    sl.addShape(pres.shapes.RECTANGLE, {
      x: 2.55, y, w: 2.6, h: 0.66,
      fill: { color: "EDE6D8" }, line: { color: "CFC5B0" },
    });
    sl.addText(c.before, {
      x: 2.65, y: y + 0.08, w: 2.35, h: 0.5,
      fontSize: 9.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
    // 화살표
    sl.addText("→", {
      x: 5.22, y: y + 0.18, w: 0.72, h: 0.3,
      fontSize: 16, fontFace: F.sans, color: C.red,
      align: "center", margin: 0,
    });
    // After
    card(sl, 6.0, y, 2.6, 0.66, C.cardBg);
    sl.addText(c.after, {
      x: 6.15, y: y + 0.08, w: 2.35, h: 0.5,
      fontSize: 9.5, fontFace: F.sans, color: C.ink,
      align: "left", margin: 0,
    });

    if (i < comparisons.length - 1) {
      sl.addShape(pres.shapes.LINE, {
        x: 0.35, y: y + 0.66, w: 8.25, h: 0,
        line: { color: C.border, width: 0.5 },
      });
    }
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 10 — RESULTS (결과)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 10, "Results · 무엇이 달라졌는가");
  ftr(sl, 10);

  sl.addText("설계 이후 작업 환경의 변화", {
    x: 0.55, y: 0.78, w: 6, h: 0.45,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  // 게임 스크린샷 (우측)
  img(sl, "game_screen.png", 6.15, 0.72, 3.5, 1.97);
  sl.addText("게임 플레이 화면 · Chapter 1", {
    x: 6.15, y: 2.71, w: 3.5, h: 0.2,
    fontSize: 8.5, fontFace: F.sans, color: C.muted, align: "center", margin: 0,
  });

  // 4개 수치 카드
  const metrics = [
    { icon: "↑", stat: "작업 속도", detail: "씬·대사 작성이 코드 없이 가능해져 설계 반복 속도 대폭 향상" },
    { icon: "✓", stat: "검증 완성도", detail: "FK·Enum·고아씬을 스크립트로 자동 탐지, 플레이 중 오류 격감" },
    { icon: "◎", stat: "설계 자율성", detail: "기획자가 에디터 내에서 데이터 직접 수정·확인 가능" },
    { icon: "⊕", stat: "확장 여력", detail: "씬 추가 시 데이터만 늘리면 됨, 코드 충돌 구조적 방지" },
  ];

  metrics.forEach((m, i) => {
    const mx = 0.35 + (i % 2) * 2.85;
    const my = 1.35 + Math.floor(i / 2) * 1.52;
    card(sl, mx, my, 2.6, 1.32, C.cardBg);
    // 아이콘
    sl.addShape(pres.shapes.OVAL, {
      x: mx + 0.12, y: my + 0.15, w: 0.44, h: 0.44,
      fill: { color: C.red }, line: { color: C.red },
    });
    sl.addText(m.icon, {
      x: mx + 0.12, y: my + 0.15, w: 0.44, h: 0.44,
      fontSize: 13, fontFace: F.sans, bold: true,
      color: C.ivory, align: "center", valign: "middle", margin: 0,
    });
    // 제목
    sl.addText(m.stat, {
      x: mx + 0.65, y: my + 0.18, w: 1.85, h: 0.28,
      fontSize: 13, fontFace: F.sans, bold: true,
      color: C.ink, align: "left", margin: 0,
    });
    // 설명
    sl.addText(m.detail, {
      x: mx + 0.12, y: my + 0.55, w: 2.35, h: 0.72,
      fontSize: 9.5, fontFace: F.sans, color: C.sub,
      align: "left", margin: 0,
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 11 — RETROSPECTIVE (회고)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgIvory };
  hdr(sl, 11, "Retrospective · 회고");
  ftr(sl, 11);

  sl.addText("프로젝트를 통해 배운 것", {
    x: 0.55, y: 0.78, w: 9, h: 0.42,
    fontSize: 22, fontFace: F.serif, bold: true,
    color: C.ink, align: "left", margin: 0,
  });

  sl.addText(
    "이번 프로젝트로 규모 확장의 임계점을 경험하고, 구조를 재설계·중심화하며 단 한 화면만큼이나 구조가 중요하다는 것을 배웠다.",
    {
      x: 0.55, y: 1.26, w: 9, h: 0.28,
      fontSize: 10.5, fontFace: F.sans, italic: true, color: C.sub,
      align: "left", margin: 0,
    }
  );

  // 두 컬럼
  const sections = [
    {
      label: "잘 된 것",
      color: C.red,
      bg: C.cardBg,
      items: [
        "초기 하드코딩 방식이 구조적으로 효율적임을 입증",
        "초기 설계 실수를 인지한 뒤 빠른 구조 재설정",
        "데이터 설계와 런타임 코드를 분리하는 원칙 확립",
        "기획 도구로서의 EditorNode 설계·구현",
        "AI를 도구로 활용해 작업 흐름을 단축시키는 방법 정착",
      ],
    },
    {
      label: "다음엔 이렇게",
      color: C.gold,
      bg: C.cardBgAlt,
      items: [
        "초기 설계 단계에서 확장성 기준 명시적으로 정의",
        "씬 단위 실시간 미리보기 환경 확보 필요",
        "기획자 테스트를 설계 단계에 통합",
        "에디터 변경사항 구조 이력 관리 체계 마련",
        "데이터 흐름 전체 테스트 자동화",
      ],
    },
  ];

  sections.forEach((sec, ci) => {
    const sx = 0.35 + ci * 4.85;
    // 섹션 헤더 바
    sl.addShape(pres.shapes.RECTANGLE, {
      x: sx, y: 1.65, w: 4.35, h: 0.34,
      fill: { color: sec.color }, line: { color: sec.color },
    });
    sl.addText(sec.label, {
      x: sx, y: 1.65, w: 4.35, h: 0.34,
      fontSize: 11, fontFace: F.sans, bold: true,
      color: C.ivory, align: "center", valign: "middle", charSpacing: 1, margin: 0,
    });
    // 카드 배경
    box(sl, sx, 1.99, 4.35, 3.05, sec.bg, sec.bg);
    // 아이템
    sec.items.forEach((item, ii) => {
      sl.addText(`${ii + 1}.  ${item}`, {
        x: sx + 0.15, y: 2.05 + ii * 0.57, w: 4.0, h: 0.5,
        fontSize: 10.5, fontFace: F.sans, color: C.ink,
        align: "left", margin: 0,
      });
      if (ii < sec.items.length - 1) {
        sl.addShape(pres.shapes.LINE, {
          x: sx + 0.15, y: 2.55 + ii * 0.57, w: 3.95, h: 0,
          line: { color: C.border, width: 0.4 },
        });
      }
    });
  });
}


// ════════════════════════════════════════════════════════════
//  SLIDE 12 — COMPETENCIES (역량 정리)
// ════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  sl.background = { color: C.bgCover };

  // 하단 밝은 스트립
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 4.8, w: 10, h: 0.825,
    fill: { color: "231A12" }, line: { color: "231A12" },
  });

  // 헤더
  sl.addText("12", {
    x: 0.55, y: 0.32, w: 0.5, h: 0.28,
    fontSize: 10, fontFace: F.sans, bold: true,
    color: C.gold, align: "left", charSpacing: 2, margin: 0,
  });
  sl.addText("COMPETENCIES  ·  이 프로젝트로 증명하는 역량", {
    x: 1.0, y: 0.32, w: 8.5, h: 0.28,
    fontSize: 9, fontFace: F.sans, bold: true,
    color: C.red, align: "left", charSpacing: 3, margin: 0,
  });
  sl.addShape(pres.shapes.LINE, {
    x: 0.55, y: 0.65, w: 8.9, h: 0,
    line: { color: "3A2E24", width: 0.75 },
  });

  // 타이틀
  sl.addText("설계 능력의 근거", {
    x: 0.55, y: 0.8, w: 9, h: 0.55,
    fontSize: 28, fontFace: F.serif, bold: true,
    color: C.ivory, align: "left", margin: 0,
  });

  // 4개 역량 카드
  const comps = [
    {
      num: "01",
      title: "시스템 구조화 능력",
      desc: "기획 데이터(분기·신뢰도·상태·증거)를 구조적으로 분류하고 재사용 가능한 형태로 설계하는 능력",
    },
    {
      num: "02",
      title: "반복화 파이프라인 설계",
      desc: "반복 가능한 작업 흐름을 xlsx↔game_data 파이프라인으로 구축. 일관된 흐름 완성.",
    },
    {
      num: "03",
      title: "데이터·구조의 시각화",
      desc: "씬 그래프, 흐름도, 노드 에디터를 통해 구조를 탐색 가능하고 편집 가능한 형태로 구현",
    },
    {
      num: "04",
      title: "AI 의미 활용 능력",
      desc: "AI를 대체재가 아닌 반복 작업 보조·구조 검토 도구로 활용. 기획 판단에 더 많은 시간 배분.",
    },
  ];

  comps.forEach((c, i) => {
    const cx = 0.35 + (i % 2) * 4.82;
    const cy = 1.52 + Math.floor(i / 2) * 1.6;
    // 다크 카드
    sl.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 4.5, h: 1.38,
      fill: { color: "2E2318" }, line: { color: "2E2318" },
    });
    // 왼쪽 레드 바
    sl.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 0.065, h: 1.38,
      fill: { color: C.red }, line: { color: C.red },
    });
    // 번호
    sl.addText(c.num, {
      x: cx + 0.15, y: cy + 0.1, w: 0.45, h: 0.28,
      fontSize: 10, fontFace: F.sans, bold: true,
      color: C.gold, align: "left", charSpacing: 1, margin: 0,
    });
    // 제목
    sl.addText(c.title, {
      x: cx + 0.15, y: cy + 0.4, w: 4.15, h: 0.3,
      fontSize: 13, fontFace: F.sans, bold: true,
      color: C.ivory, align: "left", margin: 0,
    });
    // 설명
    sl.addText(c.desc, {
      x: cx + 0.15, y: cy + 0.74, w: 4.15, h: 0.6,
      fontSize: 9.5, fontFace: F.sans, color: C.muted,
      align: "left", margin: 0,
    });
  });

  // 푸터
  sl.addShape(pres.shapes.LINE, {
    x: 0.55, y: 4.83, w: 8.9, h: 0,
    line: { color: "3A2E24", width: 0.5 },
  });
  sl.addText("경성뎐 시스템 기획 포트폴리오", {
    x: 0.55, y: 4.89, w: 7, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: "4A3E32",
    align: "left", margin: 0,
  });
  sl.addText("12", {
    x: 8.8, y: 4.89, w: 0.65, h: 0.22,
    fontSize: 8.5, fontFace: F.sans, color: "4A3E32",
    align: "right", margin: 0,
  });
}


// ════════════════════════════════════════════════════════════
//  OUTPUT
// ════════════════════════════════════════════════════════════
const OUTPUT = "G:/GSD/content/docs/portfolio/경성뎐_시스템기획_포트폴리오_v3.pptx";
pres.writeFile({ fileName: OUTPUT })
  .then(() => console.log("✅  생성 완료: " + OUTPUT))
  .catch((e) => { console.error("❌  오류:", e); process.exit(1); });
