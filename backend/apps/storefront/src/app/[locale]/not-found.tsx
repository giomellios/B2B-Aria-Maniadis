import { Button } from "@/design-system";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = (await getT()).notFound;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="max-w-md space-y-6 text-center animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="display text-5xl md:text-6xl">{t.title}</h1>
        <p className="text-muted-foreground">{t.text}</p>
        <div className="flex justify-center gap-4 pt-2">
          <Button asChild size="lg" className="group">
            <Link href="/">
              <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              {t.back}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
