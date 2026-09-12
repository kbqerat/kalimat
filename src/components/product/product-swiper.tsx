"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { CollectionWithCount } from "@/lib/data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * A touch-swipeable, mouse-draggable product carousel with prev/next
 * controls — scroll-snap under the hood, no external carousel library.
 */
export function ProductSwiper({
  products,
  collections,
  locale,
  dict,
}: {
  products: Product[];
  collections: CollectionWithCount[];
  locale: Locale;
  dict: Dictionary;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos <= 4);
    setAtEnd(pos >= max - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  function go(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === "rtl";
    const amount = el.clientWidth * 0.85 * direction * (isRtl ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  // Classic mousedown/mousemove/mouseup (not the Pointer Capture API) —
  // window-level listeners so the drag keeps tracking even once the cursor
  // leaves the track, and there's no browser/headless quirks around capture.
  function onMouseDown(e: React.MouseEvent<HTMLUListElement>) {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };

    const onMove = (ev: MouseEvent) => {
      if (!drag.current.active) return;
      const dx = ev.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      el.scrollLeft = drag.current.startScroll - dx;
    };
    const onUp = () => {
      drag.current.active = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onClickCapture(e: React.MouseEvent) {
    // A real drag just happened — swallow the click so links underneath
    // the pointer don't navigate.
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.moved = 0;
  }

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing sm:cursor-grab sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[190px] shrink-0 snap-start sm:w-[240px]">
            <ProductCard
              product={product}
              collections={collections}
              locale={locale}
              dict={dict}
            />
          </li>
        ))}
      </ul>

      <SwiperButton dir="prev" hidden={atStart} onClick={() => go(-1)} label={dict.pagination.prev} />
      <SwiperButton dir="next" hidden={atEnd} onClick={() => go(1)} label={dict.pagination.next} />
    </div>
  );
}

function SwiperButton({
  dir,
  hidden,
  onClick,
  label,
}: {
  dir: "prev" | "next";
  hidden: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-[38%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink shadow-[var(--shadow-soft)] transition-opacity hover:bg-paper-deep sm:grid",
        dir === "prev" ? "-start-4 rtl:rotate-180" : "-end-4 rtl:rotate-180",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}
