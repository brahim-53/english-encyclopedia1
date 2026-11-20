import clips from './audio-index.json' with { type: 'json' };
import { audioKey, audioText, examplesFrom } from './utterances.js';
import { escapeLiteral, textBi } from '../locale/index.js';

const volumeKey = 'erp.v1.audio-volume';
const icon = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
const safeAudio = (v) => /^[a-z0-9“"'(]/i.test(v) && /[a-z]/i.test(v) && !/[<>]/.test(v) && v.length <= 250;
export const audioLabel = (text) => `${textBi('استمع إلى', 'Listen to')}: ${text}`;
export function audioButton(value, ipa = '', exact = false) {
  const text = audioText(value);
  if (!safeAudio(text)) return '';
  const label = escapeLiteral(audioLabel(text));
  return `<button class="pronounce-button" type="button" data-pronounce="${escapeLiteral(text)}"${ipa ? ` data-pronounce-ipa="${escapeLiteral(ipa)}"` : ''}${exact ? ' data-audio-exact' : ''} aria-label="${label}" title="${label}" aria-pressed="false">${icon}</button>`;
}

export function audioControls(en, ipa = '', options) {
  const parts = examplesFrom(en, options);
  return parts.map((part) => audioButton(part, parts.length === 1 && /^[a-z'-]+$/i.test(part) ? ipa : '')).join('');
}

// Place controls next to each item in a comparison without changing its
// authored punctuation or adding the buttons inside the highlighted text.
export function audioAlong(markup, text, ipa = '', options) {
  const parts = examplesFrom(text, options);
  if (parts.length < 2 || markup.includes('<')) return markup + audioControls(text, ipa, options);
  let from = 0;
  let output = '';
  for (const part of parts) {
    const label = escapeLiteral(part);
    const at = markup.indexOf(label, from);
    if (at === -1) return markup + audioControls(text, ipa, options);
    const after = at + label.length;
    output += markup.slice(from, after) + audioButton(part);
    from = after;
  }
  return output + markup.slice(from);
}

export function audioPair(markup, text, ipa = '', exact = false) {
  const button = audioButton(text, ipa, exact);
  return button ? `<span class="pronunciation-unit" lang="en" dir="ltr">${markup}${button}</span>` : markup;
}

export function updateButton(button, state) {
  if (!button) return;
  if (state === 'idle') delete button.dataset.audioState;
  else button.dataset.audioState = state;
  button.setAttribute('aria-pressed', String(state === 'playing'));
}

export const errorMessage = () => textBi(
  'يتعذر تشغيل هذا المثال: لا يوجد ملف صالح أو صوت إنجليزي أمريكي محلي متاح.',
  'This example cannot be played: no usable clip or on-device U.S. English voice is available.',
);
export const variantError = () => textBi(
  'لا يوجد مقطع مطابق لهذا النطق البديل. لن تُشغّل الأداة نطقًا آخر مكانه.',
  'There is no usable clip for this exact pronunciation. A different variant will not be played in its place.',
);

export class PronunciationPlayer {
  constructor(base, report) {
    this.base = base;
    this.report = report;
    this.generation = 0;
    this.volume = 0.85;
    if (typeof ERP_NOTEBOOK_BUILD === 'undefined' || !ERP_NOTEBOOK_BUILD) {
      try {
        const stored = localStorage.getItem(volumeKey);
        if (stored !== null) this.volume = Math.min(1, Math.max(0, Number(stored) || 0));
      } catch {}
    }
  }

  setVolume(v) {
    this.volume = Math.min(1, Math.max(0, Number(v) || 0));
    if (this.media) this.media.volume = this.volume;
    if (typeof ERP_NOTEBOOK_BUILD === 'undefined' || !ERP_NOTEBOOK_BUILD) {
      try { localStorage.setItem(volumeKey, String(this.volume)); } catch {}
    }
  }

  stop() {
    this.generation++;
    clearTimeout(this.timer);
    if (this.media) {
      this.media.pause();
      this.media.removeAttribute('src');
      this.media = null;
    }
    if (this.utterance) {
      this.utterance.onend = this.utterance.onerror = this.utterance.onstart = null;
      globalThis.speechSynthesis?.cancel();
      this.utterance = null;
    }
    if (this.target) this.report(this.target, 'idle');
    this.target = null;
  }

  play(raw, ipa, target, exact = false) {
    const text = audioText(raw);
    if (!safeAudio(text)) return;
    this.stop();
    this.target = target;
    const id = this.generation;
    this.report(target, 'loading');
    const key = audioKey(text, ipa);
    const local = Object.hasOwn(clips, key) ? clips[key] : null;
    const isCurrent = () => id === this.generation;
    const finish = (error = false) => {
      if (!isCurrent()) return;
      this.stop();
      if (error) this.report(target, 'error', exact ? 'variant' : undefined);
    };
    const speak = () => {
      if (!isCurrent()) return;
      clearTimeout(this.timer);
      if (exact) return finish(true);
      const synth = globalThis.speechSynthesis;
      const voices = synth?.getVoices?.() || [];
      const voice = voices.find((v) => v.localService && /^en[-_]US$/i.test(v.lang) && v.default)
        || voices.find((v) => v.localService && /^en[-_]US$/i.test(v.lang));
      if (!voice || typeof SpeechSynthesisUtterance !== 'function') return finish(true);
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = 'en-US';
        u.rate = 0.89;
        u.volume = this.volume;
        u.onstart = () => {
          if (!isCurrent()) return;
          clearTimeout(this.timer);
          this.report(target, 'playing', 'device');
          this.timer = setTimeout(() => finish(true), 30000);
        };
        u.onend = () => finish();
        u.onerror = () => finish(true);
        this.utterance = u;
        this.timer = setTimeout(() => finish(true), 4500);
        synth.speak(u);
      } catch { finish(true); }
    };
    if (!local) { speak(); return; }
    const [file, start, end, kind] = local;
    const media = new Audio();
    this.media = media;
    const fallback = () => {
      if (!isCurrent() || this.media !== media) return;
      media.pause();
      media.removeAttribute('src');
      this.media = null;
      speak();
    };
    const checkEnd = () => {
      if (!isCurrent() || !end) return;
      if (media.currentTime >= end - 0.015) finish();
    };
    media.volume = this.volume;
    media.preload = 'auto';
    // Media fragments and a timeupdate guard stop before the next clip.
    media.src = new URL(file, this.base).href + (end ? `#t=${start},${end}` : '');
    media.addEventListener('error', fallback, { once: true });
    media.addEventListener('timeupdate', checkEnd);
    media.addEventListener('ended', () => finish(), { once: true });
    media.addEventListener('pause', () => {
      if (media.currentTime >= end - 0.025 && end) finish();
    });
    media.addEventListener('playing', () => {
      if (!isCurrent() || this.media !== media) return;
      if (end && Math.abs(media.currentTime - start) > .5) {
        try { media.currentTime = start; } catch { fallback(); return; }
      }
      clearTimeout(this.timer);
      this.report(target, 'playing', kind);
      this.timer = setTimeout(() => finish(), (end ? end - start : Number.isFinite(media.duration) ? media.duration : 5) * 1000 + 300);
    }, { once: true });
    this.timer = setTimeout(fallback, 5500);
    try { media.play()?.catch(fallback); } catch { fallback(); }
  }
}
