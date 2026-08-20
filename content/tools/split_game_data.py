import json
import os
import sys

import game_data_io


ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TABLE_DIR = os.path.join(ROOT_DIR, "game", "data", "tables")

TABLE_FILES = {
    "meta.json": ("first_scene",),
    "characters.json": ("characters",),
    "character_emotions.json": ("character_emotions",),
    "choice_groups.json": ("choice_groups",),
    "conditions.json": ("conditions",),
    "evidence_categories.json": ("evidence_categories",),
    "questions.json": ("questions",),
    "question_answers.json": ("question_answers",),
    "state_descriptors.json": ("state_descriptors",),
    "gauges.json": ("gauges",),
    "gauge_states.json": ("gauge_states",),
    "effects.json": ("effects",),
    "scenes.json": ("scenes",),
}


def write_tables(data):
    os.makedirs(TABLE_DIR, exist_ok=True)
    for filename, keys in TABLE_FILES.items():
        if filename == "meta.json":
            table_payload = {
                "first_scene": data.get("first_scene"),
            }
        else:
            table_payload = data
            for key in keys:
                table_payload = table_payload.get(key)

        target_path = os.path.join(TABLE_DIR, filename)
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(table_payload, f, ensure_ascii=False, indent=2)
            f.write("\n")


def load_tables():
    merged = {}
    for filename, keys in TABLE_FILES.items():
        source_path = os.path.join(TABLE_DIR, filename)
        with open(source_path, "r", encoding="utf-8-sig") as f:
            payload = json.load(f)

        if filename == "meta.json":
            merged["first_scene"] = payload.get("first_scene")
            continue

        if len(keys) != 1:
            raise ValueError(f"Unsupported key mapping: {filename}")
        merged[keys[0]] = payload

    return merged


def split_mode():
    data = game_data_io.load_game_data()
    write_tables(data)
    print(f"Split {game_data_io.CORE_PATH} + {game_data_io.CHAPTERS_DIR}/*.js -> {TABLE_DIR}")


def bundle_mode():
    data = load_tables()
    game_data_io.write_game_data(data)
    print(f"Bundled {TABLE_DIR} -> {game_data_io.CORE_PATH} + {game_data_io.CHAPTERS_DIR}/*.js")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "split"
    if mode == "split":
        split_mode()
        return
    if mode == "bundle":
        bundle_mode()
        return

    raise SystemExit("Usage: python split_game_data.py [split|bundle]")


if __name__ == "__main__":
    main()
