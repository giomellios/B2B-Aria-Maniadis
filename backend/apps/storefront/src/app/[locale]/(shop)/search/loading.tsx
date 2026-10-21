import { SearchTermSkeleton, SearchResultsSkeleton } from "@/features/catalog";

export default function SearchLoading() {
  return (
    <div className="frame mt-header pt-8 pb-20">
      <SearchTermSkeleton />
      <SearchResultsSkeleton />
    </div>
  );
}
