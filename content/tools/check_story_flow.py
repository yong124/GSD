import json
import os
import re
from collections import deque


DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), "../../game/data/game_data.js")


def read_game_data(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read().strip()
    text = re.sub(r"^window\.GAME_DATA\s*=\s*", "", text, count=1)
    text = re.sub(r";\s*$", "", text)
    return json.loads(text)


def build_scene_graph(data):
    scenes = data.get("scenes", {}) or {}
    graph = {scene_id: [] for scene_id in scenes}

    for scene_id, scene in scenes.items():
        for branch in scene.get("branches", []) or []:
            target = branch.get("next_scene")
            if target:
                graph[scene_id].append(("branch", target))

        for choice in scene.get("choices", []) or []:
            if choice.get("next_type") == "Scene" and choice.get("next_id"):
                graph[scene_id].append(("choice", choice["next_id"]))

        for choice in scene.get("evidence_choices", []) or []:
            if choice.get("next_type") == "Scene" and choice.get("next_id"):
                graph[scene_id].append(("evidence_choice", choice["next_id"]))

    return graph


def shortest_path(graph, start, goal):
    if start not in graph or goal not in graph:
        return None

    queue = deque([(start, [start])])
    seen = {start}
    while queue:
        node, path = queue.popleft()
        if node == goal:
            return path
        for _, neighbor in graph.get(node, []):
            if neighbor in seen or neighbor not in graph:
                continue
            seen.add(neighbor)
            queue.append((neighbor, path + [neighbor]))
    return None


def reachable_from(graph, start):
    queue = deque([start])
    seen = {start}
    while queue:
        node = queue.popleft()
        for _, neighbor in graph.get(node, []):
            if neighbor in seen or neighbor not in graph:
                continue
            seen.add(neighbor)
            queue.append(neighbor)
    return seen


def summarize_chapter_reachability(path):
    covered = []
    seen = set()
    for scene_id in path or []:
        match = re.match(r"^(ch\d+)_", scene_id)
        if not match:
            continue
        chapter = match.group(1)
        if chapter not in seen:
            covered.append(chapter)
            seen.add(chapter)
    return covered


def get_effect_delta(data, effect_group_id, gauge_id):
    total = 0
    for effect in data.get("effects", []) or []:
        if effect.get("effect_group_id") != effect_group_id:
            continue
        if effect.get("effect_type") != "GaugeChange":
            continue
        if effect.get("gauge_id") != gauge_id:
            continue
        total += int(effect.get("gauge_delta") or 0)
    return total


def get_gauge_default(data, gauge_id):
    for gauge in data.get("gauges", []) or []:
        if gauge.get("gauge_id") == gauge_id:
            return int(gauge.get("default_value") or 0)
    return 0


def get_condition_threshold(data, condition_group_id, gauge_id):
    for condition in data.get("conditions", []) or []:
        if condition.get("condition_group_id") != condition_group_id:
            continue
        if condition.get("condition_type") != "GaugeValue":
            continue
        if condition.get("condition_target_id") != gauge_id:
            continue
        return {
            "compare_type": condition.get("compare_type"),
            "value": int(condition.get("condition_value") or 0),
        }
    return None


def main():
    data = read_game_data(DEFAULT_INPUT)
    scenes = data.get("scenes", {}) or {}
    graph = build_scene_graph(data)
    first_scene = data.get("first_scene")

    cafe_to_well = shortest_path(graph, "ch2_cafe", "ch2_well")
    first_to_epilogue = shortest_path(graph, first_scene, "ch6_epilogue") if first_scene else None
    reachable = reachable_from(graph, first_scene) if first_scene else set()

    credibility_default = get_gauge_default(data, "Credibility")
    article_correct = get_effect_delta(data, "eff_article_correct", "Credibility")
    article_wrong = get_effect_delta(data, "eff_article_wrong", "Credibility")
    ending_b_threshold = get_condition_threshold(data, "CG_Epilogue_EndingB", "Credibility")

    article_scene = scenes.get("ch6_article", {})
    article_groups = []
    for choice in article_scene.get("choices", []) or []:
        group_id = choice.get("choice_group_id")
        if group_id and group_id not in article_groups:
            article_groups.append(group_id)

    null_endings = []
    for scene_id in ("scene_ending_erosion", "scene_gameover_credibility"):
        scene = scenes.get(scene_id, {})
        default_branch = next((branch for branch in (scene.get("branches", []) or []) if not branch.get("condition_group_id")), None)
        null_endings.append({
            "scene_id": scene_id,
            "default_next_scene": None if default_branch is None else default_branch.get("next_scene"),
        })

    summary = {
        "first_scene": first_scene,
        "ch2_cafe_to_ch2_well_path": cafe_to_well,
        "first_scene_to_ch6_epilogue_path_exists": bool(first_to_epilogue),
        "chapter_coverage_on_main_path": summarize_chapter_reachability(first_to_epilogue),
        "unreachable_scene_count_from_first_scene": len(set(scenes) - reachable) if first_scene else None,
        "ch6_article_choice_groups": article_groups,
        "credibility": {
            "default": credibility_default,
            "article_correct_delta": article_correct,
            "article_wrong_delta": article_wrong,
            "ending_b_threshold": ending_b_threshold,
            "credibility_needed_entering_article_for_all_3_correct_to_hit_threshold": (
                max(0, ending_b_threshold["value"] - (article_correct * len(article_groups)))
                if ending_b_threshold else None
            ),
        },
        "null_terminal_scenes": null_endings,
    }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
