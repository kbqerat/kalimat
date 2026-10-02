"use client";

import { localeNames, type Locale } from "@/i18n/config";
import { t } from "@/i18n/t";
import type { AmriCard } from "@/lib/data/amri-cards";
import { cn } from "@/lib/utils";
import { useSpeech, type SpeechItem } from "./use-speech";

const ROWS: { locale: Locale; badge: string; tint: string }[] = [
  { locale: "ar", badge: "ع", tint: "bg-riso-pink/10" },
  { locale: "fr", badge: "FR", tint: "bg-brand/10" },
  { locale: "en", badge: "EN", tint: "bg-riso-teal/10" },
];

export interface CardPlayerLabels {
  listen: string;
  listenAll: string;
  sentenceTitle: string;
  noSpeech: string;
  noVoice: string;
}

function SpeakButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "btn !h-11 !w-11 shrink-0 !p-0 text-lg",
        active ? "btn-primary" : "btn-ghost",
      )}
    >
      🔊
    </button>
  );
}

export function CardPlayer({
  card,
  sentence,
  labels,
}: {
  card: AmriCard;
  sentence: Record<Locale, string>;
  labels: CardPlayerLabels;
}) {
  const { supported, speaking, speak, missing } = useSpeech();
  const words: SpeechItem[] = ROWS.map(({ locale }) => ({
    key: `word-${locale}`,
    text: card[locale],
    locale,
  }));

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => speak(words)}
        disabled={!supported}
        className="btn btn-primary w-full !py-4 text-lg"
      >
        🔊 {labels.listenAll}
      </button>

      {!supported && <p className="text-sm text-riso-orange">{labels.noSpeech}</p>}
      {missing.length > 0 && (
        <p className="text-sm text-ink-soft">
          {t(labels.noVoice, { langs: missing.map((l) => localeNames[l]).join(", ") })}
        </p>
      )}

      <ul className="space-y-2.5">
        {ROWS.map(({ locale, badge, tint }, i) => (
          <li
            key={locale}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-3 transition-shadow",
              tint,
              speaking === words[i].key && "ring-2 ring-riso-orange",
            )}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-xs font-bold">
              {badge}
            </span>
            <span
              lang={locale}
              dir={locale === "ar" ? "rtl" : "ltr"}
              className={cn(
                "flex-1 font-display",
                locale === "ar" ? "text-3xl" : "text-xl",
              )}
            >
              {card[locale]}
            </span>
            <SpeakButton
              active={speaking === words[i].key}
              label={`${labels.listen} — ${localeNames[locale]}`}
              onClick={() => speak([words[i]])}
            />
          </li>
        ))}
      </ul>

      <section className="card p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          {labels.sentenceTitle}
        </h2>
        <ul className="mt-2 space-y-1.5">
          {ROWS.map(({ locale }) => {
            const key = `sentence-${locale}`;
            return (
              <li key={locale} className="flex items-center gap-3">
                <span
                  lang={locale}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="flex-1 font-semibold"
                >
                  {sentence[locale]}
                </span>
                <SpeakButton
                  active={speaking === key}
                  label={`${labels.listen} — ${localeNames[locale]}`}
                  onClick={() => speak([{ key, text: sentence[locale], locale }])}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
