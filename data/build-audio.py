"""Rebuild the offline American English clip bank. No model runs in the app.

Generate inventory with node data/audio-inventory.mjs. Supply a directory with
ONNX Community Kokoro v1.0 model_quantized.onnx as model.onnx, af_heart.bin and
hexgrad's config.json. Optional human clips live in public/audio and are kept
separate so their authors and licenses remain clear.
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys

import numpy as np
import onnxruntime as ort
from misaki import en
try:
    from misaki.espeak import EspeakFallback
except (ImportError, OSError):
    EspeakFallback = None

ROOT = pathlib.Path(__file__).resolve().parents[1]
RATE = 24000
GROUP = 48
TAIL = np.zeros(RATE // 3, dtype="<i2")
HEAD = np.zeros(RATE // 15, dtype="<i2")
PRIVATE = ROOT / "app" / "features" / "audio-index.json"
AUDIO = ROOT / "public" / "audio"
PHRASE_OVERRIDES = {
    # The default grapheme-to-phoneme path picks past-tense /rɛd/ here.
    "i read every day.": "ˌI ɹˈid ˈɛvəɹi dˈA.",
}

def phonemes(ipa):
    value = ipa.strip("/[] ").replace("g", "ɡ").replace("r", "ɹ")
    for a, b in (("tʃ", "ʧ"), ("dʒ", "ʤ"), ("eɪ", "A"), ("aɪ", "I"), ("oʊ", "O"), ("aʊ", "W"), ("ɔɪ", "Y"), ("ɝ", "ɜɹ")):
        value = value.replace(a, b)
    return value.replace("ː", "").replace(".", "")

def main():
    arg = argparse.ArgumentParser()
    arg.add_argument("inventory", type=pathlib.Path)
    arg.add_argument("model", type=pathlib.Path)
    arg.add_argument("--cache", type=pathlib.Path, required=True)
    arg.add_argument("--piper", type=pathlib.Path, help="Optional Piper en_US-ljspeech-medium ONNX model for grammar and practice")
    args = arg.parse_args()
    items = json.loads(args.inventory.read_text())
    assets = json.loads((ROOT / "data" / "human-audio.json").read_text())
    index = {}
    for record in assets:
        if (AUDIO / record["file"]).is_file():
            for key in record["keys"]:
                index[key] = [record["file"], 0, 0, "recording"]
    g2p = en.G2P(trf=False, british=False, fallback=EspeakFallback(british=False) if EspeakFallback else None)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    model = ort.InferenceSession(str(args.model / "model.onnx"), sess_options=options, providers=["CPUExecutionProvider"])
    piper = None
    if args.piper:
        from piper import PiperVoice, SynthesisConfig
        from piper.config import PiperConfig
        piper = PiperVoice(
            session=ort.InferenceSession(str(args.piper), sess_options=options, providers=["CPUExecutionProvider"]),
            config=PiperConfig.from_dict(json.loads(pathlib.Path(str(args.piper) + ".json").read_text())),
        )
        piper_config = SynthesisConfig(length_scale=1.05, normalize_audio=False, noise_scale=0.55)
    voice = np.fromfile(args.model / "af_heart.bin", dtype=np.float32).reshape(-1, 256)
    vocab = json.loads((args.model / "config.json").read_text())["vocab"]
    args.cache.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    # Reuse one exact, unambiguous word rather than synthesize it twice.
    variants = {}
    for item in items:
        spelling = item["key"].split("|")[0]
        if item["ipa"]:
            variants.setdefault(spelling, set()).add(item["key"])
    aliases = {item["key"]: next(iter(variants[item["key"]])) for item in items
               if item["key"] not in index and len(variants.get(item["key"], ())) == 1}
    remaining = [x for x in items if x["key"] not in index and x["key"] not in aliases]
    for pos in range(0, len(remaining), GROUP):
        clip_list = []
        elapsed = 0
        filename = f"us-{pos // GROUP:03d}.mp3"
        for item in remaining[pos:pos+GROUP]:
            forced = PHRASE_OVERRIDES.get(item["key"], "")
            use_piper = piper is not None and item["priority"] >= 2 and not item["ipa"] and not forced
            cache = args.cache / (hashlib.sha256((item["key"] + "\0" + item["text"] + ("\0piper" if use_piper else "") + forced).encode()).hexdigest() + ".pcm")
            if cache.exists():
                pcm = np.fromfile(cache, dtype="<i2")
            else:
                if use_piper:
                    chunks = []
                    for chunk in piper.synthesize(item["text"], piper_config):
                        arr = chunk.audio_float_array
                        pos_n = np.arange(round(len(arr) * RATE / chunk.sample_rate)) * chunk.sample_rate / RATE
                        chunks.append(np.interp(pos_n, np.arange(len(arr)), arr))
                    if not chunks:
                        continue
                    wave = np.concatenate(chunks)
                else:
                    p = forced or (phonemes(item["ipa"]) if item["ipa"] else g2p(item["text"])[0])
                    if not p or "❓" in p or len(p) > 500:
                        print(f"Skipped {item['key']}: unresolved pronunciation {p}", file=sys.stderr)
                        continue
                    ids = [vocab[ch] for ch in p if ch in vocab]
                    if not ids:
                        continue
                    wave = np.asarray(model.run(None, {"input_ids": np.array([[0, *ids, 0]], dtype=np.int64),
                        "style": voice[len(ids):len(ids)+1], "speed": np.array([0.91], dtype=np.float32)})[0]).reshape(-1)
                audible = np.flatnonzero(np.abs(wave) > 0.008)
                if not len(audible):
                    continue
                wave = wave[max(0, audible[0]-360):audible[-1]+700]
                wave = wave * min(1.4, .85 / max(float(np.max(np.abs(wave))), .01))
                pcm = (np.clip(wave, -1, 1)*32767).astype("<i2")
                pcm.tofile(cache)
            start = elapsed / RATE
            stop = (elapsed + len(HEAD) + len(pcm) + RATE // 14) / RATE
            index[item["key"]] = [filename, round(start, 4), round(stop, 4), "generated"]
            clip_list.extend((HEAD, pcm, TAIL))
            elapsed += len(HEAD) + len(pcm) + len(TAIL)
        if clip_list:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "pipe:0",
                            "-c:a", "libmp3lame", "-b:a", "56k", str(AUDIO / filename)], input=np.concatenate(clip_list).tobytes(), check=True)
        print(f"{min(pos + GROUP, len(remaining))}/{len(remaining)} items processed", flush=True)
    for alias, target in aliases.items():
        if target in index:
            index[alias] = index[target]
    PRIVATE.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Bundled {len(index)} lookup keys")
if __name__ == "__main__":
    main()
