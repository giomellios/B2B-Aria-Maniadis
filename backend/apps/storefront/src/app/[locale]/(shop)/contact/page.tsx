import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { Button } from "@/design-system";
import { buildAlternates } from "@/lib/utils";
import { EMAIL } from "@/features/home/server";
import { MailComposer } from "./mail-composer";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return {
    title: t.contact.metaTitle,
    description: t.contact.metaDescription,
    alternates: buildAlternates("/contact", locale),
  };
}

const PHONES = ["319618", "319702", "824111"];
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Ελ. Βενιζέλου 129, Γάζι, Ηράκλειο");

const sectionHead =
  "text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]";

export default async function ContactPage() {
  const t = await getT();
  const c = t.contact;

  return (
    <main className="pt-header">
      <section aria-labelledby="contact-title" className="px-4 pt-8 sm:px-5 md:pt-14">
        <h1
          id="contact-title"
          data-reveal-load
          className="text-[clamp(2.25rem,7.6vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]"
        >
          {c.title}
        </h1>
        <p
          data-reveal-load
          style={{ "--i": 1 } as React.CSSProperties}
          className="mt-8 max-w-[34ch] text-2xl leading-[1.25]"
        >
          {c.lead}
        </p>

        <dl className="mt-12 grid gap-2 md:mt-16 md:grid-cols-3">
          <div
            className="rounded-xl bg-card p-5"
            data-reveal-load
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <dt className="text-base text-muted-foreground">{c.address}</dt>
            <dd className="mt-2 text-2xl leading-snug">
              {c.addressValue.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-4 inline-block text-base"
              >
                {c.openMap} ↗
              </a>
            </dd>
          </div>
          <div
            className="rounded-xl bg-card p-5"
            data-reveal-load
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <dt className="text-base text-muted-foreground">{c.phone}</dt>
            <dd className="mt-2 text-2xl leading-snug">
              {PHONES.map((phone) => (
                <a
                  key={phone}
                  href={`tel:+302810${phone}`}
                  className="link-underline block w-fit tabular-nums"
                >
                  (2810) {phone}
                </a>
              ))}
              <span className="mt-4 block text-base text-muted-foreground">
                {c.fax} (2810) 255525
              </span>
            </dd>
          </div>
          <div
            className="rounded-xl bg-card p-5"
            data-reveal-load
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <dt className="text-base text-muted-foreground">{c.email}</dt>
            <dd className="mt-2 text-2xl leading-snug">
              <a href={`mailto:${EMAIL}`} className="link-underline break-all">
                {EMAIL}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="write-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-7 lg:pr-12">
            <h2 id="write-title" data-reveal className={sectionHead}>
              {c.formTitle}
            </h2>
            <div className="mt-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <MailComposer
                email={EMAIL}
                labels={{
                  name: c.name,
                  company: c.company,
                  message: c.message,
                  send: c.send,
                  sendNote: c.sendNote,
                  subject: c.subject,
                }}
              />
            </div>
          </div>
          <aside className="lg:col-span-5" data-reveal>
            <div className="rounded-2xl bg-card p-6 md:p-8 lg:sticky lg:top-sticky">
              <h2 className="text-2xl font-semibold tracking-[-0.01em]">{c.accountTitle}</h2>
              <p className="mt-2 text-base">{c.accountText}</p>
              <Button variant="gold" size="lg" className="mt-6" asChild>
                <Link href="/register">{c.apply}</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
