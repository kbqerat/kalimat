"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Plays a card's words: the pre-generated MP3 when there is one (see
 * src/lib/audio.ts — same voice on every phone), otherwise the browser's
 * built-in voice (Web Speech API). Device voices vary: some Android phones
 * have no Arabic voice, which `missing` reports so the UI can say so.
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
  /** Pre-generated clip; may not exist yet, then the device voice is used. */
  src?: string;
}

// Chrome drops an utterance whose object it lets get garbage-collected
// (onend never fires); keep the current ones referenced.
const alive: SpeechSynthesisUtterance[] = [];
let run = 0;
// One element for every clip: iOS only lets an element play once a tap has
// started it, and a reused element keeps that permission for the next clips.
let player: HTMLAudioElement | null = null;
// Clips that failed to load (not generated yet) — straight to the device voice.
const broken = new Set<string>();

// Pause between clips when playing several in a row.
const GAP_MS = 300;

function stopAll() {
  if (player) {
    player.onplaying = player.onended = player.onerror = null;
    player.pause();
  }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

export function useSpeech() {
  const voiceCount = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [speaking, setSpeaking] = useState<string | null>(null);
  // Set when speech was asked for but never started — Samsung phones whose
  // speech engine has no voice for the language stay silent without an error.
  const [silent, setSilent] = useState(false);
  // Locales the device voice was needed for (their clip was missing).
  const [usedDevice, setUsedDevice] = useState<Locale[]>([]);

  // Stop talking when the card changes or the page is left.
  useEffect(() => () => {
    run++;
    stopAll();
  }, []);

  /** Plays the items back to back, replacing anything already playing. */
  const speak = useCallback((items: SpeechItem[]) => {
    if (!items.length) return;
    const id = ++run;
    stopAll();
    setSpeaking(null);

    const deviceVoice = (item: SpeechItem, done: () => void) => {
      setUsedDevice((l) => (l.includes(item.locale) ? l : [...l, item.locale]));
      if (!("speechSynthesis" in window)) return done();
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
      u.onend = done;
      u.onerror = done;
      alive.splice(0, alive.length, u);
      // Android Chrome ignores a speak() right after cancel(), so wait a beat.
      setTimeout(() => {
        if (id !== run) return;
        speechSynthesis.resume(); // Chrome can be stuck paused
        speechSynthesis.speak(u);
      }, 120);
      setTimeout(() => {
        if (id === run && !started) setSilent(true);
      }, 2600);
    };

    const say = (i: number) => {
      if (id !== run) return;
      if (i === items.length) {
        setSpeaking(null);
        alive.length = 0;
        return;
      }
      const item = items[i];
      let advanced = false;
      const next = () => {
        if (advanced) return;
        advanced = true;
        say(i + 1);
      };
      const src = item.src;
      if (!src || broken.has(src)) return deviceVoice(item, next);

      // Called synchronously from the tap for the first clip — iOS needs that.
      const a = (player ??= new Audio());
      let failed = false;
      const fail = () => {
        if (failed || id !== run) return;
        failed = true;
        broken.add(src);
        a.onplaying = a.onended = a.onerror = null;
        deviceVoice(item, next);
      };
      a.onplaying = () => {
        if (id !== run) return;
        setSilent(false);
        setSpeaking(item.key);
      };
      a.onended = () => setTimeout(next, i + 1 < items.length ? GAP_MS : 0);
      a.onerror = fail;
      a.src = src;
      a.play().catch((err: DOMException) => {
        // AbortError: another tap replaced this clip — not a failure.
        if (err.name !== "AbortError") fail();
      });
    };
    say(0);
  }, []);

  // Only meaningful once voices have loaded; before that, assume all present.
  const missing: Locale[] =
    voiceCount > 0 ? usedDevice.filter((l) => !pickVoice(l)) : [];

  // No clip and no speech engine: nothing can play.
  const unsupported = voiceCount === -1 && usedDevice.length > 0;

  return { unsupported, speaking, speak, missing, silent };
}
