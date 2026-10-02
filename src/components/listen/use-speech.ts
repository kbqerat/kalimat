"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Text-to-speech through the browser's built-in voices (Web Speech API) —
 * no audio files to record or host. Voice coverage depends on the device:
 * iOS and Android ship Arabic, French and English voices; some desktop
 * browsers lack Arabic, which `missing` reports so the UI can say so.
 */

const BCP47: Record<Locale, string> = { ar: "ar-SA", fr: "fr-FR", en: "en-US" };

// Voices load asynchronously (Chrome fires `voiceschanged` once they're in),
// so subscribe to that and snapshot the count: -1 means no speech support.
function subscribe(onChange: () => void) {
  if (!("speechSynthesis" in window)) return () => {};
  speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => speechSynthesis.removeEventListener("voiceschanged", onChange);
}
const getSnapshot = () => ("speechSynthesis" in window ? speechSynthesis.getVoices().length : -1);
const getServerSnapshot = () => 0;

function pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  const norm = (lang: string) => lang.replace("_", "-").toLowerCase();
  return (
    voices.find((v) => norm(v.lang) === BCP47[locale].toLowerCase()) ??
    voices.find((v) => norm(v.lang).startsWith(locale))
  );
}

export interface SpeechItem {
  /** Identifies the button that's playing, for the "speaking" highlight. */
  key: string;
  text: string;
  locale: Locale;
}

// Chrome drops an utterance whose object it lets get garbage-collected
// (onend never fires); keep the current ones referenced.
const alive: SpeechSynthesisUtterance[] = [];
let run = 0;

export function useSpeech() {
  const voiceCount = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const supported = voiceCount !== -1;
  const [speaking, setSpeaking] = useState<string | null>(null);
  // Set when speech was asked for but never started — Samsung phones whose
  // speech engine has no voice for the language stay silent without an error.
  const [silent, setSilent] = useState(false);

  // Stop talking when the card changes or the page is left.
  useEffect(() => () => {
    run++;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }, []);

  /** Speaks the items back to back, replacing anything already playing. */
  const speak = useCallback((items: SpeechItem[]) => {
    if (!("speechSynthesis" in window) || !items.length) return;
    const id = ++run;
    speechSynthesis.cancel();
    setSpeaking(null);

    // Android Chrome ignores a speak() right after cancel(), and loses queued
    // utterances, so wait a beat, then say one item at a time.
    const say = (i: number) => {
      if (id !== run) return;
      if (i === items.length) {
        setSpeaking(null);
        alive.length = 0;
        return;
      }
      const item = items[i];
      const u = new SpeechSynthesisUtterance(item.text);
      u.lang = BCP47[item.locale];
      const voice = pickVoice(item.locale);
      if (voice) u.voice = voice;
      u.rate = 0.85; // a touch slower — the listeners are small children
      let started = false;
      u.onstart = () => {
        started = true;
        setSilent(false);
        if (id === run) setSpeaking(item.key);
      };
      u.onend = () => say(i + 1);
      u.onerror = () => say(i + 1);
      alive.splice(0, alive.length, u);
      speechSynthesis.resume(); // Chrome can be stuck paused
      speechSynthesis.speak(u);
      setTimeout(() => {
        if (id === run && !started) setSilent(true);
      }, 2500);
    };
    setTimeout(() => say(0), 120);
  }, []);

  // Only meaningful once voices have loaded; before that, assume all present.
  const missing: Locale[] =
    voiceCount > 0 ? (["ar", "fr", "en"] as const).filter((l) => !pickVoice(l)) : [];

  return { supported, speaking, speak, missing, silent };
}
