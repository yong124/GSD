"""
game_data.js 를 core 파일 + 챕터별 파일(game/data/chapters/ch{N}.js)로 나눠 읽고 쓰는 공용 모듈.

목적은 성능이 아니라 편집 편의성이다 — scenes 데이터가 game_data.js 부피의 대부분을
차지해서, 씬을 챕터 단위 파일로 쪼개면 특정 챕터만 열어보고 고칠 수 있다.

파일 레이아웃:
  game/data/game_data.js        -> scenes를 제외한 나머지 테이블 전부 (first_scene, characters, ...)
  game/data/chapters/ch{N}.js   -> 그 챕터에 속한 scenes만, Object.assign(window.GAME_DATA.scenes, {...})

load_game_data() 는 이 둘을 병합해서, 기존 단일 game_data.js 하나를 읽은 것과 동일한
dict(scenes 포함 전체 13개 top-level 키)를 반환한다. write_game_data()는 그 역방향.
"""

import glob
import json
import os
import re


ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CORE_PATH = os.path.join(ROOT_DIR, "game", "data", "game_data.js")
CHAPTERS_DIR = os.path.join(ROOT_DIR, "game", "data", "chapters")

_CORE_PREFIX_RE = re.compile(r"^window\.GAME_DATA\s*=\s*", re.DOTALL)
_CORE_SUFFIX_RE = re.compile(r";\s*$")
_CHAPTER_RE = re.compile(
    r"Object\.assign\(window\.GAME_DATA\.scenes,\s*(\{.*\})\s*\);\s*$", re.DOTALL
)


def _read_text(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return f.read()


def parse_core_js(text):
    trimmed = text.strip()
    trimmed = _CORE_PREFIX_RE.sub("", trimmed, count=1)
    trimmed = _CORE_SUFFIX_RE.sub("", trimmed)
    return json.loads(trimmed)


def parse_chapter_js(text):
    match = _CHAPTER_RE.search(text.strip())
    if not match:
        raise ValueError("챕터 파일 형식이 아님: Object.assign(window.GAME_DATA.scenes, {...}); 를 찾을 수 없음")
    return json.loads(match.group(1))


def load_game_data(core_path=CORE_PATH, chapters_dir=CHAPTERS_DIR):
    data = parse_core_js(_read_text(core_path))
    scenes = {}
    chapter_files = sorted(glob.glob(os.path.join(chapters_dir, "*.js")))
    for path in chapter_files:
        scenes.update(parse_chapter_js(_read_text(path)))
    data["scenes"] = scenes
    return data


def _chapter_filename(chapter_value):
    return f"ch{chapter_value}.js"


def write_game_data(data, core_path=CORE_PATH, chapters_dir=CHAPTERS_DIR):
    scenes = data.get("scenes") or {}

    groups = {}
    for scene_id, scene in scenes.items():
        chapter = scene.get("chapter")
        groups.setdefault(chapter, {})[scene_id] = scene

    os.makedirs(chapters_dir, exist_ok=True)

    # 이번에 쓰지 않는 챕터의 낡은 파일은 정리한다 (챕터가 통째로 사라진 경우 대비)
    keep_filenames = {_chapter_filename(chapter) for chapter in groups}
    for existing in glob.glob(os.path.join(chapters_dir, "*.js")):
        if os.path.basename(existing) not in keep_filenames:
            os.remove(existing)

    for chapter, chapter_scenes in groups.items():
        ordered = {sid: chapter_scenes[sid] for sid in sorted(chapter_scenes)}
        target_path = os.path.join(chapters_dir, _chapter_filename(chapter))
        payload = json.dumps(ordered, ensure_ascii=False, indent=2)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(f"Object.assign(window.GAME_DATA.scenes, {payload});\n")

    core_data = {k: v for k, v in data.items() if k != "scenes"}
    core_data["scenes"] = {}
    os.makedirs(os.path.dirname(core_path) or ".", exist_ok=True)
    with open(core_path, "w", encoding="utf-8") as f:
        f.write("window.GAME_DATA = ")
        json.dump(core_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
