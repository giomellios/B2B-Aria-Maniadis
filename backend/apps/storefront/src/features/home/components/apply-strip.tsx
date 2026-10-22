import { getLocale, getT } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";
import { PHONE_HREF } from "@/features/home/components/home-hero";

/**
 * A field of the opposite tone: the heading and a
 * three-cell bar that starts the trade-account form with the company and email filled in.
 */
export async function ApplyStrip() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const apply = t.home.apply;

  return (
    <section
      aria-labelledby="apply-title"
      className="mt-36 overflow-hidden bg-foreground pt-16 pb-16 md:pt-24 text-background md:mt-52 md:pb-24"
    >
      <div className="px-4 sm:px-5">
        <h2
          id="apply-title"
          data-reveal
          className="text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em] md:mt-[4.5rem]"
        >
          {apply.title}
        </h2>
        <form
          action={localizePath("/register", locale)}
          method="get"
          className="mt-10 grid gap-2 md:grid-cols-3"
          data-reveal
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <label className="block">
            <span className="sr-only">{apply.company}</span>
            <input
              name="company"
              autoComplete="organization"
              placeholder={apply.company}
              className="h-15 w-full rounded-lg bg-background/8 px-5 text-center text-base text-background outline-none transition-colors placeholder:text-background/60 focus:bg-background/16 md:h-24"
            />
          </label>
          <label className="block">
            <span className="sr-only">{apply.email}</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={apply.email}
              className="h-15 w-full rounded-lg bg-background/8 px-5 text-center text-base text-background outline-none transition-colors placeholder:text-background/60 focus:bg-background/16 md:h-24"
            />
          </label>
          <button
            type="submit"
            className="h-15 rounded-lg bg-background text-base font-medium text-foreground transition-[background-color,transform] duration-200 hover:bg-gold hover:text-gold-foreground active:scale-[0.98] md:h-24"
          >
            {apply.submit} →
          </button>
        </form>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <p>{apply.note}</p>
          <p className="md:col-start-3">
            <a href={PHONE_HREF} className="link-underline">
              {apply.call}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
