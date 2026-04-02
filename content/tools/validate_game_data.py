"""
경성뎐 : game_data.js 구조 검수 스크립트

검수 항목:
- first_scene 존재 여부
- 씬 next_scene / branch / choice 참조 씬 존재 여부
- 씬 내부 dialogue / choice / branch order 중복 여부
- 동일 씬 내 dialogue label 중복 여부
- evidence id 중복 여부

오류가 있으면 exit code 1로 종료한다.
"""

import argparse
import json
import os
import re
import sys
from collections import Counter


DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), "../../game/data/game_data.js")


def parse_args():
    parser = argparse.ArgumentParser(description="game_data.js 구조 검수")
    parser.add_argument("input", nargs="?", default=DEFAULT_INPUT, help="검수할 game_data.js 경로")
    return parser.parse_args()


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def parse_game_data(text):
    trimmed = text.strip()
    if trimmed.startswith("window.GAME_DATA"):
        trimmed = re.sub(r"^window\.GAME_DATA\s*=\s*", "", trimmed, count=1)
        trimmed = re.sub(r";\s*$", "", trimmed)
    return json.loads(trimmed)


def find_duplicates(values):
    counts = Counter(values)
    return sorted([value for value, count in counts.items() if count > 1])


def validate_scene_refs(scene_id, scenes, issues):
    scene = scenes[scene_id]
    next_scene = scene.get("next_scene")
    if next_scene and next_scene not in scenes:
        issues.append(f"[Scene.next_scene] {scene_id} -> {next_scene} (없는 씬)")

    for branch in scene.get("branches", []):
        target = branch.get("next_scene")
        if target and target not in scenes:
            issues.append(
                f"[Branch.next_scene] {scene_id} order={branch.get('order')} -> {target} (없는 씬)"
            )

    for choice in scene.get("choices", []):
        target = choice.get("next_scene")
        if target and target not in scenes:
            issues.append(
                f"[Choice.next_scene] {scene_id} order={choice.get('order')} -> {target} (없는 씬)"
            )


def validate_scene_orders(scene_id, scene, issues):
    for key in ("dialogues", "choices", "branches"):
        items = scene.get(key, [])
        orders = [item.get("order") for item in items if item.get("order") is not None]
        duplicates = find_duplicates(orders)
        for dup in duplicates:
            issues.append(f"[Duplicate.order] {scene_id} {key} order={dup}")


def validate_dialog_labels(scene_id, scene, issues):
    labels = [
        line.get("label")
        for line in scene.get("dialogues", [])
        if isinstance(line.get("label"), str) and line.get("label").strip()
    ]
    duplicates = find_duplicates(labels)
    for dup in duplicates:
        issues.append(f"[Duplicate.label] {scene_id} label={dup}")


def validate_evidence_ids(scenes, issues):
    evidence_ids = []
    for scene in scenes.values():
        for ev in scene.get("evidence", []):
            evidence_id = ev.get("evidence_id")
            if evidence_id:
                evidence_ids.append(evidence_id)
    duplicates = find_duplicates(evidence_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.evidence_id] {dup}")


def main():
    args = parse_args()
    input_path = os.path.abspath(args.input)

    if not os.path.exists(input_path):
        print(f"파일 없음: {input_path}")
        sys.exit(1)

    data = parse_game_data(read_text(input_path))
    scenes = data.get("scenes", {})
    issues = []

    first_scene = data.get("first_scene")
    if not first_scene:
        issues.append("[Meta.first_scene] first_scene 누락")
    elif first_scene not in scenes:
        issues.append(f"[Meta.first_scene] {first_scene} (없는 씬)")

    for scene_id in sorted(scenes.keys()):
        scene = scenes[scene_id]
        validate_scene_refs(scene_id, scenes, issues)
        validate_scene_orders(scene_id, scene, issues)
        validate_dialog_labels(scene_id, scene, issues)

    validate_evidence_ids(scenes, issues)

    print(f"검수 대상: {input_path}")
    print(f"씬 수: {len(scenes)}")

    if issues:
        print("오류 발견:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)

    print("검수 통과: 구조상 오류 없음")


if __name__ == "__main__":
    main()
