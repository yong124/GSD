"""
경성뎐 : game_data.js 구조 검수 스크립트

검수 항목:
- first_scene 존재 여부
- branch / choice 참조 씬 존재 여부
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
    with open(path, "r", encoding="utf-8-sig") as f:
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


def to_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def validate_scene_refs(scene_id, scenes, issues):
    scene = scenes[scene_id]
    for branch in scene.get("branches", []):
        target = branch.get("next_scene")
        if target and target not in scenes:
            issues.append(
                f"[Branch.next_scene] {scene_id} order={branch.get('order')} -> {target} (없는 씬)"
            )

    for choice in scene.get("choices", []):

        next_type = choice.get("next_type")
        next_id = choice.get("next_id")
        if next_type == "Scene" and next_id and next_id not in scenes:
            issues.append(
                f"[Choice.next_id] {scene_id} order={choice.get('order')} -> {next_id} (없는 씬)"
            )


def validate_scene_orders(scene_id, scene, issues):
    for key in ("dialogues", "choices", "branches"):
        items = scene.get(key, [])
        orders = [item.get("order") for item in items if item.get("order") is not None]
        duplicates = find_duplicates(orders)
        for dup in duplicates:
            issues.append(f"[Duplicate.order] {scene_id} {key} order={dup}")


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


def validate_conditions(data, issues):
    conditions = data.get("conditions", []) or []
    valid_condition_types = {
        "GaugeValue",
        "Trust",
        "EvidenceOwned",
        "ChoiceSelected",
        "RevealedCharacter",
        "SceneProgressIndex",
        "SceneVisited",
    }
    gauge_ids = {item.get("gauge_id") for item in (data.get("gauges", []) or []) if item.get("gauge_id")}
    scene_ids = set((data.get("scenes", {}) or {}).keys())
    character_ids = set((data.get("characters", {}) or {}).keys())
    choice_ids = {
        choice.get("choice_id")
        for scene in (data.get("scenes", {}) or {}).values()
        for choice in ((scene.get("choices", []) or []) + (scene.get("evidence_choices", []) or []))
        if choice.get("choice_id")
    }
    choice_ids.update({
        question.get("solved_state_id")
        for question in (data.get("questions", []) or [])
        if question.get("solved_state_id")
    })
    evidence_ids = {
        evidence.get("evidence_id")
        for scene in (data.get("scenes", {}) or {}).values()
        for evidence in (scene.get("evidence", []) or [])
        if evidence.get("evidence_id")
    }
    condition_ids = [item.get("condition_id") for item in conditions if item.get("condition_id")]
    duplicates = find_duplicates(condition_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.condition_id] {dup}")

    for item in conditions:
        condition_id = item.get("condition_id") or "(unknown)"
        if not item.get("condition_group_id"):
            issues.append(f"[Condition.condition_group_id] {condition_id} missing ConditionGroupID")
        if not item.get("condition_type"):
            issues.append(f"[Condition.condition_type] {condition_id} missing ConditionType")
        if not item.get("compare_type"):
            issues.append(f"[Condition.compare_type] {condition_id} missing CompareType")
        condition_type = item.get("condition_type")
        if condition_type and condition_type not in valid_condition_types:
            issues.append(f"[Condition.condition_type] {condition_id} invalid ConditionType: {condition_type}")
        target_id = item.get("condition_target_id")
        if condition_type == "ChoiceSelected" and target_id:
            target_ids = [value.strip() for value in str(target_id).split("|") if value.strip()]
            for choice_id in target_ids:
                if choice_id not in choice_ids:
                    issues.append(f"[Condition.condition_target_id] {condition_id} -> {choice_id} (missing ChoiceID)")
        if condition_type == "EvidenceOwned" and target_id and target_id not in evidence_ids:
            issues.append(f"[Condition.condition_target_id] {condition_id} -> {target_id} (missing EvidenceID)")
        if condition_type == "GaugeValue" and target_id and target_id not in gauge_ids:
            issues.append(f"[Condition.condition_target_id] {condition_id} -> {target_id} (missing GaugeID)")
        if condition_type == "SceneVisited" and target_id and target_id not in scene_ids:
            issues.append(f"[Condition.condition_target_id] {condition_id} -> {target_id} (missing SceneID)")
        if condition_type == "Trust" and target_id and target_id not in character_ids:
            issues.append(f"[Condition.condition_target_id] {condition_id} -> {target_id} (missing CharacterID)")


def validate_choice_groups(data, issues):
    choice_groups = data.get("choice_groups", []) or []
    group_ids = [item.get("choice_group_id") for item in choice_groups if item.get("choice_group_id")]
    duplicates = find_duplicates(group_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.choice_group_id] {dup}")

    valid_answer_types = {"Text", "Evidence", None, ""}
    scenes = data.get("scenes", {}) or {}
    scene_dialog_ids = set()
    evidence_dialog_keys = set()
    for scene in scenes.values():
        for dialogue in scene.get("dialogues", []) or []:
            dialog_id = dialogue.get("dialog_id")
            if dialog_id:
                scene_dialog_ids.add(dialog_id)
        for dialog_key in (scene.get("evidence_dialogues", {}) or {}).keys():
            if dialog_key:
                evidence_dialog_keys.add(dialog_key)
    for item in choice_groups:
        choice_group_id = item.get("choice_group_id") or "(unknown)"
        answer_type = item.get("answer_type")
        if answer_type not in valid_answer_types:
            issues.append(f"[ChoiceGroup.answer_type] {choice_group_id} invalid AnswerType: {answer_type}")
        if answer_type == "Evidence":
            default_dialog_id = item.get("default_dialog_id")
            if not default_dialog_id:
                issues.append(f"[ChoiceGroup.default_dialog_id] {choice_group_id} missing DefaultDialogID")
            elif default_dialog_id not in scene_dialog_ids and default_dialog_id not in evidence_dialog_keys:
                issues.append(f"[ChoiceGroup.default_dialog_id] {choice_group_id} -> {default_dialog_id} (missing DialogID)")


def validate_choice_answer_types(data, issues):
    scenes = data.get("scenes", {}) or {}
    choice_groups = {
        item.get("choice_group_id"): item
        for item in (data.get("choice_groups", []) or [])
        if item.get("choice_group_id")
    }
    evidence_ids = {
        evidence.get("evidence_id")
        for scene in scenes.values()
        for evidence in (scene.get("evidence", []) or [])
        if evidence.get("evidence_id")
    }

    for scene_id, scene in scenes.items():
        for choice in scene.get("choices", []) or []:
            choice_id = choice.get("choice_id") or f"{scene_id}:{choice.get('order')}"
            group = choice_groups.get(choice.get("choice_group_id"))
            answer_type = group.get("answer_type") if group else "Text"
            if answer_type == "Evidence":
                evidence_id = choice.get("evidence_id")
                if not evidence_id:
                    issues.append(f"[Choice.evidence_id] {choice_id} missing EvidenceID for Evidence answer type")
                elif evidence_id not in evidence_ids:
                    issues.append(f"[Choice.evidence_id] {choice_id} -> {evidence_id} (missing EvidenceID)")
                if not choice.get("next_id"):
                    issues.append(f"[Choice.next_id] {choice_id} missing next_id for Evidence answer type")


def validate_evidence_categories(data, issues):
    categories = data.get("evidence_categories", []) or []
    category_ids = [item.get("category_id") for item in categories if item.get("category_id")]
    duplicates = find_duplicates(category_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.evidence_category_id] {dup}")


def validate_investigations(data, issues):
    investigations = data.get("investigations", []) or []
    investigation_ids = [item.get("investigation_id") for item in investigations if item.get("investigation_id")]
    duplicates = find_duplicates(investigation_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.investigation_id] {dup}")


def validate_gauges(data, scenes, issues):
    gauges = data.get("gauges", []) or []
    gauge_states = data.get("gauge_states", []) or []
    gauge_ids = [item.get("gauge_id") for item in gauges if item.get("gauge_id")]
    duplicates = find_duplicates(gauge_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.gauge_id] {dup}")

    gauge_id_set = set(gauge_ids)
    for gauge in gauges:
        gauge_id = gauge.get("gauge_id") or "(unknown)"
        if not gauge.get("label"):
            issues.append(f"[Gauge.label] {gauge_id} missing Label")
        if gauge.get("min_value") is None:
            issues.append(f"[Gauge.min_value] {gauge_id} missing MinValue")
        if gauge.get("max_value") is None:
            issues.append(f"[Gauge.max_value] {gauge_id} missing MaxValue")
        if gauge.get("default_value") is None:
            issues.append(f"[Gauge.default_value] {gauge_id} missing DefaultValue")
        min_value = to_number(gauge.get("min_value"))
        max_value = to_number(gauge.get("max_value"))
        if min_value is not None and max_value is not None and min_value > max_value:
            issues.append(f"[Gauge.range] {gauge_id} min_value > max_value")

    for row in gauge_states:
        gauge_id = row.get("gauge_id") or "(unknown)"
        if gauge_id not in gauge_id_set:
            issues.append(f"[GaugeState.gauge_id] {gauge_id} missing GaugeID")
        if row.get("min_value") is None:
            issues.append(f"[GaugeState.min_value] {gauge_id}/{row.get('label') or '(unknown)'} missing MinValue")
        if row.get("max_value") is None:
            issues.append(f"[GaugeState.max_value] {gauge_id}/{row.get('label') or '(unknown)'} missing MaxValue")
        if not row.get("label"):
            issues.append(f"[GaugeState.label] {gauge_id} missing Label")
        trigger_scene_id = row.get("trigger_scene_id")
        if trigger_scene_id and trigger_scene_id not in scenes:
            issues.append(f"[GaugeState.trigger_scene_id] {gauge_id} -> {trigger_scene_id} (missing SceneID)")


def validate_effects(data, issues):
    effects = data.get("effects", []) or []
    gauge_ids = {item.get("gauge_id") for item in (data.get("gauges", []) or []) if item.get("gauge_id")}
    evidence_ids = {
        evidence.get("evidence_id")
        for scene in (data.get("scenes", {}) or {}).values()
        for evidence in (scene.get("evidence", []) or [])
        if evidence.get("evidence_id")
    }
    character_ids = set((data.get("characters", {}) or {}).keys())

    for effect in effects:
        effect_group_id = effect.get("effect_group_id") or "(unknown)"
        effect_type = effect.get("effect_type")
        if not effect_group_id:
            issues.append("[Effect.effect_group_id] missing EffectGroupID")
        if effect_type == "GaugeChange" and effect.get("gauge_id") not in gauge_ids:
            issues.append(f"[Effect.gauge_id] {effect_group_id} -> {effect.get('gauge_id')} (missing GaugeID)")
        if effect_type == "EvidenceGive" and effect.get("evidence_id") and effect.get("evidence_id") not in evidence_ids:
            issues.append(f"[Effect.evidence_id] {effect_group_id} -> {effect.get('evidence_id')} (missing EvidenceID)")
        if effect_type == "TrustChange" and effect.get("trust_character_id") not in character_ids:
            issues.append(f"[Effect.trust_character_id] {effect_group_id} -> {effect.get('trust_character_id')} (missing CharacterID)")


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
    numeric_state_ids = {"ResonanceLevel", "InvestigationScore", "SongsoonTrust", "ReadRitualScore", "SolvedQuestionCount"}
    evidence_ids = {
        evidence.get("evidence_id")
        for scene in (data.get("scenes", {}) or {}).values()
        for evidence in (scene.get("evidence", []) or [])
        if evidence.get("evidence_id")
    }
    condition_group_ids = {
        condition.get("condition_group_id")
        for condition in (data.get("conditions", []) or [])
        if condition.get("condition_group_id")
    }
    question_ids = [question.get("question_id") for question in questions if question.get("question_id")]
    duplicates = find_duplicates(question_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.question_id] {dup}")

    for question in questions:
        if not question.get("question_id"):
            issues.append("[Question.question_id] missing QuestionID")
        if not question.get("title"):
            issues.append(f"[Question.title] {question.get('question_id') or '(unknown)'} missing Title")
        resolution_type = question.get("resolution_type") or "Evidence"
        if resolution_type not in {"Evidence", "Contradiction"}:
            issues.append(f"[Question.resolution_type] {question.get('question_id') or '(unknown)'} invalid ResolutionType: {resolution_type}")
        visible_condition_group_ids = question.get("visible_condition_group_ids") or []
        if not isinstance(visible_condition_group_ids, list):
            issues.append(f"[Question.visible_condition_group_ids] {question.get('question_id') or '(unknown)'} must be a list")
        else:
            for condition_group_id in visible_condition_group_ids:
                if condition_group_id not in condition_group_ids:
                    issues.append(f"[Question.visible_condition_group_ids] {question.get('question_id') or '(unknown)'} -> {condition_group_id} (missing ConditionGroupID)")
        state_conditions = question.get("state_conditions") or []
        if not isinstance(state_conditions, list):
            issues.append(f"[Question.state_conditions] {question.get('question_id') or '(unknown)'} must be a list")
        else:
            for index, item in enumerate(state_conditions):
                if not isinstance(item, dict):
                    issues.append(f"[Question.state_conditions] {question.get('question_id') or '(unknown)'}[{index}] must be an object")
                    continue
                condition_group_id = item.get("condition_group_id")
                if not condition_group_id:
                    issues.append(f"[Question.state_conditions] {question.get('question_id') or '(unknown)'}[{index}] missing condition_group_id")
                elif condition_group_id not in condition_group_ids:
                    issues.append(f"[Question.state_conditions] {question.get('question_id') or '(unknown)'}[{index}] -> {condition_group_id} (missing ConditionGroupID)")
                if not item.get("result_value"):
                    issues.append(f"[Question.state_conditions] {question.get('question_id') or '(unknown)'}[{index}] missing result_value")
        related_ids = question.get("related_evidence_ids") or []
        for evidence_id in related_ids:
            if evidence_id not in evidence_ids:
                issues.append(f"[Question.related_evidence_ids] {question.get('question_id') or '(unknown)'} -> {evidence_id} (missing EvidenceID)")
        solution_evidence_ids = question.get("solution_evidence_ids") or []
        for evidence_id in solution_evidence_ids:
            if evidence_id not in evidence_ids:
                issues.append(f"[Question.solution_evidence_ids] {question.get('question_id') or '(unknown)'} -> {evidence_id} (missing EvidenceID)")
            if related_ids and evidence_id not in related_ids:
                issues.append(f"[Question.solution_evidence_ids] {question.get('question_id') or '(unknown)'} solution evidence must be included in related_evidence_ids")
        solution_mode = question.get("solution_mode")
        if solution_mode and solution_mode not in {"Any", "All"}:
            issues.append(f"[Question.solution_mode] {question.get('question_id') or '(unknown)'} invalid SolutionMode: {solution_mode}")
        solved_state_id = question.get("solved_state_id")
        if solved_state_id and not str(solved_state_id).startswith("QuestionSolved_"):
            issues.append(f"[Question.solved_state_id] {question.get('question_id') or '(unknown)'} invalid SolvedStateID: {solved_state_id}")
        reward_state_id = question.get("reward_state_id")
        if reward_state_id and reward_state_id not in numeric_state_ids:
            issues.append(f"[Question.reward_state_id] {question.get('question_id') or '(unknown)'} invalid RewardStateID: {reward_state_id}")
        if resolution_type == "Contradiction":
            if not question.get("contradiction_prompt"):
                issues.append(f"[Question.contradiction_prompt] {question.get('question_id') or '(unknown)'} missing ContradictionPrompt")
            if not question.get("contradiction_statement"):
                issues.append(f"[Question.contradiction_statement] {question.get('question_id') or '(unknown)'} missing ContradictionStatement")


def validate_state_descriptors(data, issues):
    descriptors = data.get("state_descriptors", []) or []
    numeric_state_ids = {"ResonanceLevel", "InvestigationScore", "SongsoonTrust", "ReadRitualScore", "SolvedQuestionCount"}
    derived_state_ids = {"InvestigationProgress"}
    descriptor_ids = [descriptor.get("descriptor_id") for descriptor in descriptors if descriptor.get("descriptor_id")]
    duplicates = find_duplicates(descriptor_ids)
    for dup in duplicates:
        issues.append(f"[Duplicate.descriptor_id] {dup}")

    for descriptor in descriptors:
        descriptor_id = descriptor.get("descriptor_id") or "(unknown)"
        target_state_type = descriptor.get("target_state_type") or ("Derived" if descriptor.get("target_state_id") == "InvestigationProgress" else "Numeric")
        target_state_id = descriptor.get("target_state_id")
        if target_state_type not in {"Numeric", "Derived"}:
            issues.append(f"[StateDescriptor.target_state_type] {descriptor_id} invalid TargetStateType: {target_state_type}")
        if not descriptor.get("target_state_id"):
            issues.append(f"[StateDescriptor.target_state_id] {descriptor_id} missing TargetStateID")
        elif target_state_type == "Numeric" and target_state_id not in numeric_state_ids:
            issues.append(f"[StateDescriptor.target_state_id] {descriptor_id} invalid numeric TargetStateID: {target_state_id}")
        elif target_state_type == "Derived" and target_state_id not in derived_state_ids:
            issues.append(f"[StateDescriptor.target_state_id] {descriptor_id} invalid derived TargetStateID: {target_state_id}")
        if descriptor.get("min_value") is None:
            issues.append(f"[StateDescriptor.min_value] {descriptor_id} missing MinValue")
        if descriptor.get("max_value") is None:
            issues.append(f"[StateDescriptor.max_value] {descriptor_id} missing MaxValue")
        if not descriptor.get("label"):
            issues.append(f"[StateDescriptor.label] {descriptor_id} missing Label")

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
        validate_dialogue_character_refs(scene_id, scene, data, issues)

    validate_evidence_ids(scenes, issues)
    validate_characters(data, issues)
    validate_conditions(data, issues)
    validate_choice_groups(data, issues)
    validate_choice_answer_types(data, issues)
    validate_evidence_categories(data, issues)
    validate_investigations(data, issues)
    validate_gauges(data, scenes, issues)
    validate_effects(data, issues)
    validate_questions(data, issues)
    validate_state_descriptors(data, issues)

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
