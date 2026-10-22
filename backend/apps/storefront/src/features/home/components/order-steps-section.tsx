import { getT } from "@/lib/i18n/server";

/** The ordering story, from application to the shop's shelf, as six steps in order. */
export async function OrderStepsSection() {
  const t = await getT();
  const steps = t.home.steps;

  return (
    <section aria-labelledby="steps-title" className="mt-36 px-4 sm:px-5 md:mt-52">
      <h2
        id="steps-title"
        data-reveal
        className="text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]"
      >
        {steps.title}
      </h2>
      <ol className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {steps.items.map((item, i) => (
          <li
            key={item.title}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
            className="flex flex-col rounded-xl bg-card p-5"
          >
            <span aria-hidden className="text-2xl font-semibold tabular-nums text-gold">
              {i + 1}
            </span>
            <h3 className="mt-6 text-base font-semibold leading-tight">{item.title}</h3>
            <p className="mt-2 text-base leading-[1.45]">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
