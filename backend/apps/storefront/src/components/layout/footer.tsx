import { cacheLife } from "next/cache";
import { getTopCollections } from "@/lib/vendure/cached";
import Image from "next/image";
import Link from "next/link";

async function Copyright() {
  "use cache";
  cacheLife("days");

  return <div>© {new Date().getFullYear()} Vendure Store. All rights reserved.</div>;
}

export async function Footer() {
  "use cache";
  cacheLife("days");

  const collections = await getTopCollections();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          footer here
        </div>
      </div>
    </footer>
  );
}
