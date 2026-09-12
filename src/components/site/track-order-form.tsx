"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localeHref } from "@/i18n/routing";

export function TrackOrderForm({
  locale,
  placeholder,
  cta,
  errorText,
}: {
  locale: Locale;
  placeholder: string;
  cta: string;
  errorText: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ref = value.trim();
    if (ref.length < 4) {
      setError(true);
      return;
    }
    router.push(localeHref(locale, `/order/${encodeURIComponent(ref.toUpperCase())}`));
  }

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder={placeholder}
          className="field text-center font-display text-lg tracking-widest uppercase sm:text-start"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          {cta}
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-riso-orange">{errorText}</p>}
    </div>
  );
}
