"""Build sharded JSON from the CMU Pronouncing Dictionary (cmudict.dict).
Output: public/dict/<first-letter>.json  ->  { word: ["ARPAbet pron", ...], ... }
Source: https://github.com/cmusphinx/cmudict  (BSD-style license, see data/dict/LICENSE.txt)
Usage:  python3 data/build-dict.py
"""
import json, re, os, collections
src = os.path.join(os.path.dirname(__file__), 'dict', 'cmudict_original.dict')
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'dict')
shards = collections.defaultdict(dict)
for line in open(src, encoding='utf-8'):
    line = line.split('#')[0].strip()
    if not line: continue
    w, *ph = line.split()
    w = re.sub(r'\(\d+\)$', '', w).lower()
    key = w[0] if re.match(r'[a-z]', w[0]) else '_'
    shards[key].setdefault(w, []).append(' '.join(ph))
os.makedirs(out, exist_ok=True)
tot = 0
for k, d in shards.items():
    with open(os.path.join(out, k + '.json'), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    tot += len(d)
print('shards:', len(shards), 'words:', tot)
