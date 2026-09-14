"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-context";
import { submitOrder } from "@/app/[lang]/(storefront)/checkout/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localeHref } from "@/i18n/routing";
import { formatMad, isValidMoroccanPhone } from "@/lib/format";
import { MOROCCAN_CITIES, shippingFor } from "@/lib/site";
import { cn } from "@/lib/utils";

type FieldKey = "name" | "phone" | "city" | "address" | "cart" | "generic";

export function CheckoutForm({
  locale,
  dict,
  shippingFlatMad,
  freeShippingThresholdMad,
}: {
  locale: Locale;
  dict: Dictionary;
  shippingFlatMad: number;
  freeShippingThresholdMad: number;
}) {
  const router = useRouter();
  const { items, subtotalMad, clear, ready } = useCart();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const shipping = shippingFor(subtotalMad, shippingFlatMad, freeShippingThresholdMad);
  const total = subtotalMad + shipping;

  const errText: Record<Exclude<FieldKey, "generic">, string> = {
    name: dict.checkout.errorName,
    phone: dict.checkout.errorPhone,
    city: dict.checkout.errorCity,
    address: dict.checkout.errorAddress,
    cart: dict.checkout.errorCart,
  };

  if (ready && items.length === 0) {
    return (
      <div className="card p-14 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-2xl">
          🛒
        </span>
        <p className="mt-4 font-display text-xl">{dict.cart.empty}</p>
        <Link
          href={localeHref(locale, "/products")}
          className="btn btn-primary mt-6"
        >
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const customerName = String(fd.get("customerName") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const city = String(fd.get("city") ?? "").trim();
    const address = String(fd.get("address") ?? "").trim();

    const next: Partial<Record<FieldKey, string>> = {};
    if (customerName.length < 2) next.name = errText.name;
    if (!isValidMoroccanPhone(phone)) next.phone = errText.phone;
    if (city.length < 2) next.city = errText.city;
    if (address.length < 10) next.address = errText.address;
    if (items.length === 0) next.cart = errText.cart;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      const res = await submitOrder({
        customerName,
        phone,
        city,
        address,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      if (res.ok) {
        clear();
        router.push(localeHref(locale, `/order/${res.ref}`));
      } else if (res.field && res.field in errText) {
        setErrors({ [res.field]: errText[res.field as keyof typeof errText] });
      } else {
        setErrors({ generic: dict.checkout.errorGeneric });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <fieldset className="card space-y-4 p-5 sm:p-6">
          <legend className="flex items-center gap-2 px-1 font-display text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm">
              📍
            </span>
            {dict.checkout.contact}
          </legend>

          <Field label={dict.checkout.fullName} error={errors.name}>
            <input name="customerName" autoComplete="name" className="field" required />
          </Field>

          <Field label={dict.checkout.phone} hint={dict.checkout.phoneHint} error={errors.phone}>
            <input
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0612345678"
              className="field"
              required
            />
          </Field>

          <Field label={dict.checkout.city} error={errors.city}>
            <input
              name="city"
              list="morocco-cities"
              autoComplete="address-level2"
              placeholder={dict.checkout.cityPlaceholder}
              className="field"
              required
            />
            <datalist id="morocco-cities">
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field
            label={dict.checkout.address}
            hint={dict.checkout.addressHint}
            error={errors.address}
          >
            <textarea name="address" rows={3} className="field" required />
          </Field>
        </fieldset>

        {errors.generic && (
          <p className="rounded-lg border border-riso-orange bg-riso-orange/10 p-3 text-sm text-riso-orange">
            {errors.generic}
          </p>
        )}
      </div>

      <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm">
            🧾
          </span>
          <h2 className="font-display text-lg">{dict.checkout.summary}</h2>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 py-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-linear-to-br from-brand/15 to-brand/5 text-sm">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="opacity-70">🗂️</span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-soft">
                {i.qty}× {i.title[locale]}
              </span>
              <span className="shrink-0 font-semibold">
                {formatMad(i.priceMad * i.qty, locale)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
            <dd>{formatMad(subtotalMad, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{dict.cart.shipping}</dt>
            <dd>{shipping === 0 ? dict.cart.shippingFree : formatMad(shipping, locale)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-display">{dict.cart.total}</span>
          <span className="font-display text-xl">{formatMad(total, locale)}</span>
        </div>

        <button
          type="submit"
          disabled={pending || !ready}
          className={cn("btn mt-5 w-full", pending ? "btn-brand" : "btn-primary")}
        >
          {pending ? dict.checkout.placing : dict.checkout.placeOrder}
        </button>
        <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
          {dict.checkout.agree}
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {hint && <span className="ms-2 text-xs font-normal text-ink-soft/70">{hint}</span>}
      <div className="mt-1">{children}</div>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-riso-orange">{error}</span>
      )}
    </label>
  );
}
