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


def validate_characters(data, issues):
    characters = data.get("characters", {}) or {}
    character_emotions = data.get("character_emotions", {}) or {}

    for character_id, character in characters.items():
        if not isinstance(character, dict):
            issues.append(f"[Character.invalid] {character_id} is not an object")
            continue
        default_emotion_type = character.get("default_emotion_type")
        if default_emotion_type and default_emotion_type not in (character_emotions.get(character_id) or {}):
            issues.append(
                f"[Character.default_emotion_type] {character_id} -> {default_emotion_type} (missing EmotionType)"
            )

    for character_id, emotion_map in character_emotions.items():
        if character_id not in characters:
            issues.append(f"[CharacterEmotion.missing_character] {character_id}")
            continue
        if not isinstance(emotion_map, dict):
            issues.append(f"[CharacterEmotion.invalid] {character_id} is not an object")
            continue
        if "Neutral" not in emotion_map:
            issues.append(f"[CharacterEmotion.missing_neutral] {character_id}")


def validate_dialogue_character_refs(scene_id, scene, data, issues):
    characters = data.get("characters", {}) or {}
    character_emotions = data.get("character_emotions", {}) or {}

    for dialogue in scene.get("dialogues", []):
        speaker_id = dialogue.get("speaker_id")
        emotion_type = dialogue.get("emotion_type")

        if speaker_id and speaker_id not in characters:
            issues.append(
                f"[Dialogue.speaker_id] {scene_id} order={dialogue.get('order')} -> {speaker_id} (missing CharacterID)"
            )
            continue

        if speaker_id and emotion_type:
            emotion_map = character_emotions.get(speaker_id, {})
            if emotion_type not in emotion_map:
                issues.append(
                    f"[Dialogue.emotion_type] {scene_id} order={dialogue.get('order')} -> {speaker_id}/{emotion_type} (missing EmotionType)"
                )


def validate_questions(data, issues):
    questions = data.get("questions", []) or []
    known_rule_ids = {rule.get("rule_id") for rule in (data.get("rules", []) or []) if rule.get("rule_id")}
    question_ids = [question.get("question_id") for question in questions if question.get("question_id")]
    duplicates = find_duplicates(question_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.question_id] {dup}")

    for question in questions:
        if not question.get("question_id"):
            issues.append("[Question.question_id] missing QuestionID")
        if not question.get("title"):
            issues.append(f"[Question.title] {question.get('question_id') or '(unknown)'} missing Title")
        visible_rule_id = question.get("visible_rule_id")
        state_rule_id = question.get("state_rule_id")
        if visible_rule_id and visible_rule_id not in known_rule_ids:
            issues.append(f"[Question.visible_rule_id] {question.get('question_id') or '(unknown)'} -> {visible_rule_id} (missing RuleID)")
        if state_rule_id and state_rule_id not in known_rule_ids:
            issues.append(f"[Question.state_rule_id] {question.get('question_id') or '(unknown)'} -> {state_rule_id} (missing RuleID)")


def validate_state_descriptors(data, issues):
    descriptors = data.get("state_descriptors", []) or []
    descriptor_ids = [descriptor.get("descriptor_id") for descriptor in descriptors if descriptor.get("descriptor_id")]
    duplicates = find_duplicates(descriptor_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.descriptor_id] {dup}")

    for descriptor in descriptors:
        descriptor_id = descriptor.get("descriptor_id") or "(unknown)"
        if not descriptor.get("target_flag_id"):
            issues.append(f"[StateDescriptor.target_flag_id] {descriptor_id} missing TargetFlagID")
        if descriptor.get("min_value") is None:
            issues.append(f"[StateDescriptor.min_value] {descriptor_id} missing MinValue")
        if descriptor.get("max_value") is None:
            issues.append(f"[StateDescriptor.max_value] {descriptor_id} missing MaxValue")
        if not descriptor.get("label"):
            issues.append(f"[StateDescriptor.label] {descriptor_id} missing Label")


def validate_rules(data, issues):
    rules = data.get("rules", []) or []
    rule_row_ids = [rule.get("rule_row_id") for rule in rules if rule.get("rule_row_id")]
    duplicates = find_duplicates(rule_row_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.rule_row_id] {dup}")

    for rule in rules:
        rule_row_id = rule.get("rule_row_id") or "(unknown)"
        if not rule.get("rule_id"):
            issues.append(f"[Rule.rule_id] {rule_row_id} missing RuleID")
        if not rule.get("rule_kind"):
            issues.append(f"[Rule.rule_kind] {rule_row_id} missing RuleKind")
        if not rule.get("fact_type"):
            issues.append(f"[Rule.fact_type] {rule_row_id} missing FactType")
        if not rule.get("operator"):
            issues.append(f"[Rule.operator] {rule_row_id} missing Operator")


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
        validate_dialogue_character_refs(scene_id, scene, data, issues)

    validate_evidence_ids(scenes, issues)
    validate_characters(data, issues)
    validate_questions(data, issues)
    validate_state_descriptors(data, issues)
    validate_rules(data, issues)

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
