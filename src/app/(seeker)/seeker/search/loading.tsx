import { SkeletonList } from "@/components/ui/Skeleton";
export default function SearchLoading() {
  return (
    <div className="flex gap-6">
      <div className="w-64 h-96 bg-gray-200 rounded-xl animate-pulse shrink-0" />
      <div className="flex-1"><SkeletonList count={4} /></div>
    </div>
  );
}
