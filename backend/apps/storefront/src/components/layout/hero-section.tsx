import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section aria-label="Welcome to Maniadis" className="bg-muted">
      <div className="container mx-auto px-4 py-24 md:py-40">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
            Wholesale Collections
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground leading-tight">
            Bags &amp; Hats{" "}
            <em className="not-italic font-extralight text-muted-foreground">
              for Every Season
            </em>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto">
            Curated wholesale accessories for retailers who value quality and distinction.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="min-w-[180px]">
              <Link href="/search">Browse Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
