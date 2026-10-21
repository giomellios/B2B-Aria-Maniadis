import type { Metadata } from "next";
import Image from "next/image";
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
        <div className="grid gap-10 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-7">
            <h1
              id="contact-title"
              data-reveal-load
              className="text-[clamp(2.75rem,7.6vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]"
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
          </div>
          <figure
            className="md:col-span-5"
            data-reveal-load
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <video
              src="/world/heraklion-2013.webm"
              poster="/world/heraklion-2013-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              width={640}
              height={480}
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <figcaption className="mt-3 text-sm text-muted-foreground">{c.videoCaption}</figcaption>
          </figure>
        </div>

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

      <figure className="mt-36 px-4 sm:px-5 md:mt-52" data-reveal>
        <Image
          src="/world/megalo-kastron-1858.jpg"
          alt={c.panoramaCaption}
          width={1248}
          height={146}
          sizes="100vw"
          className="w-full rounded-lg bg-[#e9e0cf]"
        />
        <figcaption className="mt-3 max-w-[56ch] text-base text-muted-foreground">
          {c.panoramaCaption}
        </figcaption>
      </figure>

      <section aria-labelledby="write-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-5">
          <figure className="lg:col-span-7" data-reveal>
            <Image
              src="/world/crete-admiralty-chart-1858.jpg"
              alt={c.mapAlt}
              width={2400}
              height={1615}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full rounded-lg"
            />
            <figcaption className="mt-3 max-w-[56ch] text-base text-muted-foreground">
              {c.chartCaption}
              <span className="mt-1 block text-sm">{c.credit}</span>
            </figcaption>
          </figure>
          <div className="lg:col-span-5 lg:pl-8">
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
            <div className="mt-14 overflow-hidden rounded-xl bg-card" data-reveal>
              <Image
                src="/catalogue/scenes/p242.jpg"
                alt={t.about.photoAlt.replace("{code}", "p. 241")}
                width={1394}
                height={1900}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[16/9] w-full object-cover object-[50%_30%]"
              />
              <div className="p-5">
                <h3 className="text-2xl font-semibold tracking-[-0.01em]">{c.accountTitle}</h3>
                <p className="mt-2 text-base">{c.accountText}</p>
                <Button variant="gold" size="lg" className="mt-5" asChild>
                  <Link href="/register">{c.apply}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
