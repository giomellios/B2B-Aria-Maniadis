import { SearchTermSkeleton, SearchResultsSkeleton } from "@/features/catalog";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <SearchTermSkeleton />
      <SearchResultsSkeleton />
    </div>
  );
}
