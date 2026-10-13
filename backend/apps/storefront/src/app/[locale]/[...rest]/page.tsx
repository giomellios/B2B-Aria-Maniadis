import { notFound } from "next/navigation";

// Unknown URLs inside a locale (e.g. /el/does-not-exist) render the localized not-found page.
export default function CatchAllPage() {
  notFound();
}
