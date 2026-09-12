"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { ProductType } from "@/lib/data/types";
import { PRODUCT_PLACEHOLDER } from "@/lib/product-visuals";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
  type,
  badge,
}: {
  images: string[];
  alt: string;
  type: ProductType;
  /** Optional sale badge text, e.g. "−40 DH". */
  badge?: string;
}) {
  const placeholder = PRODUCT_PLACEHOLDER[type];
  const [index, setIndex] = useState(0);
  const count = images.length;
  const has = count > 0;
  const step = (n: number) => setIndex((p) => (p + n + count) % count);

  return (
    <div>
      <div className="card relative aspect-square overflow-hidden">
        {has ? (
          images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${alt} — ${i + 1}`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                i === index ? "" : "hidden",
              )}
            />
          ))
        ) : (
          <span
            className={`grid h-full w-full place-items-center bg-linear-to-br text-8xl ${placeholder.from} ${placeholder.to}`}
          >
            <span className="opacity-70">{placeholder.icon}</span>
          </span>
        )}

        {badge && <span className="badge-sale absolute start-4 top-4">{badge}</span>}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="←"
              className="btn btn-ghost absolute start-3 top-1/2 -translate-y-1/2 !h-9 !w-9 !p-0"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="→"
              className="btn btn-ghost absolute end-3 top-1/2 -translate-y-1/2 !h-9 !w-9 !p-0"
            >
              ›
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "h-16 w-16 overflow-hidden rounded-lg border-2",
                i === index ? "border-brand" : "border-line",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
