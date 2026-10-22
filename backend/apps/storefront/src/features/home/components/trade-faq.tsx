import { getT } from "@/lib/i18n/server";

/** Trade terms as reading text: each answer is one paragraph opened by its question. */
export async function TradeFaq({ compact = false }: { compact?: boolean }) {
  const t = await getT();
  const faq = t.home.faq;

  return (
    <section
      aria-labelledby="faq-title"
      className={compact ? "frame mt-24 md:mt-32" : "mt-36 px-4 sm:px-5 md:mt-52"}
    >
      <div className="grid gap-8 md:grid-cols-12 md:gap-5">
        <h2
          id="faq-title"
          data-reveal
          className={
            compact
              ? "text-2xl font-semibold tracking-[-0.01em] md:col-span-4"
              : "text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em] md:col-span-4"
          }
        >
          {faq.title}
        </h2>
        <div
          className="gap-14 md:col-span-8 md:columns-2"
          data-reveal
          style={{ "--i": 1 } as React.CSSProperties}
        >
          {faq.items.map((item) => (
            <p key={item.q} className="mb-5 break-inside-avoid text-[1.0625rem] leading-[1.55]">
              <span className="font-semibold">{item.q}</span> {item.a}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
