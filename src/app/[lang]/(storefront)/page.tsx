import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WaveDivider } from "@/components/decor/wave-divider";
import { Reveal } from "@/components/motion/reveal";
import { TiltPhoto } from "@/components/motion/tilt-photo";
import { CollectionCard } from "@/components/product/collection-card";
import { ProductGrid } from "@/components/product/product-grid";
import { Testimonials } from "@/components/site/testimonials";
import heroMain from "@/images/hero-main.webp";
import langFr from "@/images/img2.webp";
import langEn from "@/images/img3.jpg";
import langAr from "@/images/img5.webp";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import { getCollections, getProducts } from "@/lib/data";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const [featured, all, collections] = await Promise.all([
    getProducts({ featuredOnly: true }),
    getProducts(),
    getCollections(),
  ]);
  const bestsellers = [...all]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 8);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand/[0.07] via-paper to-riso-yellow/[0.12]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(color-mix(in_oklab,var(--color-brand)_16%,transparent)_1.5px,transparent_1.5px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-riso-yellow/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -start-20 -bottom-32 h-80 w-80 rounded-full bg-riso-teal/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute end-1/3 top-1/2 h-56 w-56 rounded-full bg-riso-pink/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-[var(--page-margin)] py-16 sm:py-24 md:grid-cols-2 md:gap-8">
          <Reveal>
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper py-1.5 pe-3.5 ps-2 text-xs font-bold text-brand shadow-[var(--shadow-soft)]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-riso-orange text-[0.65rem] text-white">
                  🚚
                </span>
                {dict.home.heroEyebrow}
              </span>

              <h1 className="relative mt-5 max-w-lg font-display text-4xl leading-[1.05] text-brand sm:text-6xl">
                {dict.home.heroTitle}
                <svg
                  aria-hidden
                  viewBox="0 0 200 14"
                  className="mt-1 h-3 w-40 text-riso-yellow sm:w-52"
                >
                  <path
                    d="M2 10 C 40 2, 80 2, 100 8 S 160 14, 198 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </h1>

              <p className="mt-4 max-w-md text-base text-ink-soft sm:text-[1.05rem]">
                {dict.home.heroSub}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={localeHref(locale, "/products")}
                  className="btn btn-primary group"
                >
                  {dict.home.heroCta}
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180"
                  >
                    →
                  </span>
                </Link>
                <Link
                  href={localeHref(locale, "/collections")}
                  className="btn btn-ghost bg-paper"
                >
                  {dict.home.heroCtaSecondary}
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} y={26}>
            <div className="float-slow mx-auto w-full max-w-[19rem] sm:max-w-sm">
              <TiltPhoto className="aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-soft)] ring-8 ring-paper">
                <Image
                  src={heroMain}
                  alt={dict.home.heroTitle}
                  fill
                  priority
                  sizes="(min-width: 640px) 384px, 76vw"
                  className="object-cover"
                />
              </TiltPhoto>
            </div>
          </Reveal>
        </div>

        <WaveDivider color="text-paper" />
      </section>

      {/* trust row */}
      <section className="bg-paper pb-10 sm:pb-14">
        <div className="mx-auto grid max-w-6xl gap-3 px-[var(--page-margin)] sm:grid-cols-3 sm:gap-4">
          {[
            [dict.trust.shippingTitle, dict.trust.shippingSub, "🚚", "bg-brand/10"],
            [dict.trust.codTitle, dict.trust.codSub, "🔒", "bg-riso-teal/10"],
            [dict.trust.reviewsTitle, dict.trust.reviewsSub, "⭐", "bg-riso-yellow/20"],
          ].map(([title, sub, icon, tint], i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="card flex h-full items-center gap-3.5 p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg ${tint}`}
                >
                  {icon}
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-xs text-ink-soft">{sub}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* languages */}
      <div className="mx-auto max-w-6xl px-[var(--page-margin)]">
        <section className="py-14">
          <SectionHead
            eyebrow={dict.home.languagesEyebrow}
            title={dict.home.languagesTitle}
            sub={dict.home.languagesSub}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                slug: "cartes-francais",
                image: langFr,
                flag: "🇫🇷",
                name: "Français",
                tagline: dict.home.langFrTagline,
              },
              {
                slug: "cartes-anglais",
                image: langEn,
                flag: "🇬🇧",
                name: "English",
                tagline: dict.home.langEnTagline,
              },
              {
                slug: "cartes-arabe",
                image: langAr,
                flag: "🇲🇦",
                name: "العربية",
                tagline: dict.home.langArTagline,
              },
            ].map((lng) => (
              <Link
                key={lng.slug}
                href={localeHref(locale, `/collections/${lng.slug}`)}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
              >
                <Image
                  src={lng.image}
                  alt={`${lng.name} — ${lng.tagline}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-2xl leading-none">{lng.flag}</span>
                  <h3 className="mt-1.5 font-display text-xl">{lng.name}</h3>
                  <p className="mt-1 text-sm text-white/85">{lng.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto hidden max-w-6xl px-[var(--page-margin)] md:block">
        {/* collections */}
        <section className="py-14">
          <Reveal>
            <SectionHead
              eyebrow={dict.home.collectionsEyebrow}
              title={dict.home.collectionsTitle}
              sub={dict.home.collectionsSub}
            />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {collections.map((c) => (
                <CollectionCard key={c.slug} collection={c} locale={locale} dict={dict} />
              ))}
            </div>
          </Reveal>
        </section>
      </div>

      {/* featured */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-6xl px-[var(--page-margin)]">
          <Reveal>
            <SectionHead
              eyebrow={dict.home.featuredEyebrow}
              title={dict.home.featuredTitle}
              sub={dict.home.featuredSub}
              href={localeHref(locale, "/products")}
              hrefLabel={dict.home.viewAll}
            />
            <div className="mt-6">
              <ProductGrid
                products={featured}
                collections={collections}
                locale={locale}
                dict={dict}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-[var(--page-margin)]">
        {/* bestsellers */}
        <section className="py-14">
          <Reveal>
            <SectionHead
              eyebrow={dict.home.bestsellersEyebrow}
              title={dict.home.bestsellersTitle}
              href={localeHref(locale, "/products")}
              hrefLabel={dict.home.viewAll}
            />
            <div className="mt-6">
              <ProductGrid
                products={bestsellers}
                collections={collections}
                locale={locale}
                dict={dict}
              />
            </div>
          </Reveal>
        </section>
      </div>

      {/* testimonials */}
      <Testimonials dict={dict} />

      {/* how it works */}
      <section className="relative overflow-hidden bg-brand py-16 text-white sm:py-20">
        <WaveDivider color="text-canvas" flip />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(white_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-[var(--page-margin)]">
          <Reveal>
            <div className="text-center md:text-start">
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                {dict.home.howEyebrow}
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                {dict.home.howTitle}
              </h2>
            </div>
          </Reveal>

          <ol className="relative mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
            <div
              aria-hidden
              className="absolute top-7 hidden h-px w-full border-t-2 border-dashed border-white/25 md:block"
            />
            {[
              [dict.home.step1Title, dict.home.step1Body, "🛍️", "bg-riso-yellow text-ink"],
              [dict.home.step2Title, dict.home.step2Body, "📝", "bg-riso-pink text-white"],
              [dict.home.step3Title, dict.home.step3Body, "💵", "bg-riso-teal text-white"],
            ].map(([title, body, icon, tint], i) => (
              <Reveal key={title} delay={i * 0.1}>
                <li className="relative text-center md:text-start">
                  <span
                    className={`relative mx-auto grid h-14 w-14 place-items-center rounded-2xl text-xl shadow-[var(--shadow-soft)] md:mx-0 ${tint}`}
                  >
                    {icon}
                    <span className="absolute -end-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white font-display text-[0.7rem] text-brand shadow-sm">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 font-display text-base">{title}</h3>
                  <p className="mt-1.5 text-sm text-white/75">{body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            {eyebrow}
          </span>
        )}
        <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}
      </div>
      {href && hrefLabel && (
        <Link
          href={href}
          className="text-sm font-semibold text-brand hover:underline"
        >
          {hrefLabel} →
        </Link>
      )}
    </header>
  );
}
