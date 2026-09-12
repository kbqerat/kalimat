import { cn } from "@/lib/utils";

/** Amber star rating. `value` is 0–5. */
export function Stars({
  value,
  className,
  size = 14,
}: {
  value: number;
  className?: string;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={cn("relative inline-block leading-none align-middle", className)}
      style={{ fontSize: size }}
      aria-hidden
    >
      <span className="text-[#d6dae4]">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#f6b73c]"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
