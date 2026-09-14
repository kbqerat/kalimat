import { Reveal } from "@/components/motion/reveal";
import { Stars } from "@/components/product/stars";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Testimonials({ dict }: { dict: Dictionary }) {
  const { eyebrow, title, sub, items } = dict.testimonials;

  return (
    <div className="mx-auto max-w-6xl px-[var(--page-margin)]">
      <section className="py-14">
        <Reveal>
          <header className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              {eyebrow}
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{sub}</p>
          </header>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.08}>
              <figure className="card flex h-full flex-col gap-3 p-5">
                <Stars value={review.rating} />
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                  “{review.text}”
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-1">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {review.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{review.name}</span>
                    <span className="block text-xs text-ink-soft">{review.city}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
