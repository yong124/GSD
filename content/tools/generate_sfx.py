"""Generate original, nonverbal scene effects as PCM WAV files."""

import math
import random
import struct
import wave
from pathlib import Path


RATE = 44100
OUTPUT = Path(__file__).resolve().parents[2] / "game" / "assets" / "sfx"
RNG = random.Random(1932)


def silence(seconds):
    return [0.0] * int(seconds * RATE)


def mix(target, source, offset=0.0, gain=1.0):
    start = int(offset * RATE)
    for i in range(min(len(source), len(target) - start)):
        target[start + i] += source[i] * gain


def impact(seconds, modes, decay, noise=0.2):
    samples = silence(seconds)
    filtered = 0.0
    for i in range(len(samples)):
        t = i / RATE
        filtered = filtered * 0.55 + RNG.uniform(-1, 1) * 0.45
        body = sum(weight * math.sin(2 * math.pi * frequency * t)
                   * math.exp(-t * decay * (1 + j * 0.25))
                   for j, (frequency, weight) in enumerate(modes))
        attack = min(1.0, t / 0.0015)
        samples[i] = attack * (body + noise * filtered * math.exp(-t * 70))
    return samples


def air(seconds, pulses, brightness=0.3):
    samples = silence(seconds)
    filtered = 0.0
    for i in range(len(samples)):
        t = i / RATE
        filtered += brightness * (RNG.uniform(-1, 1) - filtered)
        envelope = sum(gain * math.exp(-((t - center) / width) ** 2)
                       for center, width, gain in pulses)
        samples[i] = filtered * envelope
    return samples


def hum(seconds, base, tension=0.0):
    samples = silence(seconds)
    for i in range(len(samples)):
        t = i / RATE
        envelope = min(1.0, t / 0.3) * min(1.0, (seconds - t) / 0.7)
        vibrato = 0.018 * math.sin(2 * math.pi * 4.3 * t)
        phase = 2 * math.pi * base * t + vibrato
        voice = (math.sin(phase) + 0.3 * math.sin(phase * 2)
                 + 0.12 * math.sin(phase * 3))
        dissonance = tension * math.sin(2 * math.pi * base * 1.05946 * t)
        samples[i] = envelope * (voice + dissonance) * (0.8 + 0.2 * math.sin(t * 3))
    return samples


def write_sound(name, samples, peak, room=0.0):
    # Short reflections give impacts a room without adding a constant ambience loop.
    if room:
        dry = samples[:]
        mix(samples, dry, 0.047, room)
        mix(samples, dry, 0.113, room * 0.5)
    # Fade the edges to avoid PCM clicks, and keep each effect's intended relative level.
    fade = int(RATE * 0.008)
    for i in range(min(fade, len(samples) // 2)):
        gain = i / fade
        samples[i] *= gain
        samples[-i - 1] *= gain
    maximum = max(abs(value) for value in samples) or 1.0
    scale = peak * 32767 / maximum
    pcm = struct.pack(f"<{len(samples)}h", *(round(value * scale) for value in samples))
    with wave.open(str(OUTPUT / f"{name}.wav"), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    wood = [(145, 0.7), (310, 0.3), (670, 0.12)]
    metal = [(97, 0.65), (247, 0.35), (619, 0.18), (1433, 0.08)]
    write_sound("gavel_strike", impact(0.85, wood, 13, 0.7), 0.64, 0.24)
    write_sound("door_slam", impact(1.8, metal, 5, 0.8), 0.7, 0.35)
    write_sound("glass_set", impact(0.7, [(960, 0.2), (2460, 0.7), (3970, 0.3)], 14), 0.28)

    paper = air(1.2, [(0.2, 0.09, 0.5), (0.48, 0.13, 1), (0.85, 0.15, 0.6)], 0.6)
    write_sound("paper_rustle", paper, 0.26)
    pencil = air(1.55, [(t, 0.045, 1) for t in [0.12, 0.25, 0.43, 0.55, 0.78, 0.93, 1.12, 1.3]], 0.7)
    write_sound("pencil_write", pencil, 0.18)
    write_sound("gasp", air(0.8, [(0.18, 0.11, 1), (0.4, 0.18, 0.25)], 0.12), 0.35)

    steps = silence(2.5)
    for t, gain in [(0.05, 1), (0.61, 0.8), (1.19, 0.9), (1.81, 0.7)]:
        mix(steps, impact(0.45, [(82, 0.8), (190, 0.18)], 21, 0.7), t, gain)
    write_sound("footsteps_stone", steps, 0.4, 0.3)

    lock = silence(1.0)
    for t, frequency in [(0.08, 1800), (0.27, 1350), (0.55, 720)]:
        mix(lock, impact(0.35, [(frequency, 0.5), (frequency * 1.7, 0.2)], 28, 0.3), t)
    write_sound("lock_turn", lock, 0.36)
    rattle = silence(1.6)
    for t in [0.03, 0.18, 0.33, 0.57, 0.89]:
        mix(rattle, impact(0.65, metal, 12, 0.3), t, 0.6 + RNG.random() * 0.4)
    write_sound("metal_rattle", rattle, 0.42, 0.22)

    creak = silence(1.65)
    for i in range(len(creak)):
        t = i / RATE
        envelope = math.sin(math.pi * t / 1.65) ** 2
        phase = 2 * math.pi * (115 * t + 20 * t * t) + 0.6 * math.sin(2 * math.pi * 13 * t)
        creak[i] = envelope * (math.sin(phase) + 0.25 * math.sin(phase * 3))
    write_sound("door_creak", creak, 0.3, 0.15)
    phone = silence(0.75)
    mix(phone, impact(0.4, [(390, 0.5), (910, 0.2)], 20, 0.5), 0.03)
    mix(phone, impact(0.4, [(280, 0.7)], 26, 0.3), 0.25)
    write_sound("telephone_pickup", phone, 0.3)

    snap = silence(0.8)
    for t in [0.04, 0.1, 0.2]:
        mix(snap, impact(0.35, [(420, 0.4), (1210, 0.2)], 42, 1), t)
    write_sound("bone_snap", snap, 0.52)
    wet = air(1.0, [(0.15, 0.035, 0.8), (0.28, 0.09, 1), (0.53, 0.12, 0.5)], 0.045)
    mix(wet, impact(0.45, [(72, 0.6), (170, 0.2)], 18, 0.2), 0.1, 0.35)
    write_sound("wet_crack", wet, 0.48)

    heartbeat = silence(3.3)
    for t in [0.1, 1.15, 2.2]:
        mix(heartbeat, impact(0.45, [(48, 1), (76, 0.2)], 14, 0), t)
        mix(heartbeat, impact(0.35, [(58, 1)], 20, 0), t + 0.22, 0.6)
    write_sound("heartbeat_low", heartbeat, 0.46)
    write_sound("hum_dissonant", hum(2.6, 174, 0.25), 0.24)
    write_sound("ritual_chant", hum(3.8, 196, 0.18), 0.28, 0.3)
    whisper = air(2.1, [(0.6, 0.35, 1), (1.3, 0.3, 0.7)], 0.07)
    mix(whisper, hum(2.1, 137, 0.45), gain=0.14)
    write_sound("whisper_dissonant", whisper, 0.24, 0.24)

    sting = hum(1.5, 73, 0.65)
    mix(sting, impact(1.5, [(46, 0.8), (293, 0.3), (311, 0.3)], 4, 0.5), gain=1.4)
    write_sound("sting_horror", sting, 0.55, 0.25)
    reveal = silence(1.3)
    mix(reveal, impact(1.1, [(523, 0.45), (1046, 0.12)], 5, 0), 0.05)
    mix(reveal, impact(0.9, [(784, 0.35), (1568, 0.08)], 6, 0), 0.28)
    write_sound("evidence_reveal", reveal, 0.23, 0.15)
    write_sound("ui_hover", impact(0.075, [(660, 0.5), (990, 0.15)], 65, 0.05), 0.22)
    write_sound("ui_click", impact(0.09, [(240, 0.6), (720, 0.2)], 55, 0.3), 0.34)
    write_sound("text_tick", impact(0.04, [(320, 0.4), (1350, 0.2)], 100, 0.8), 0.28)
    print("Generated 22 original WAV effects in", OUTPUT)


if __name__ == "__main__":
    main()
