import { SkeletonList } from "@/components/ui/Skeleton";
export default function FeedLoading() {
  return (
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
      <SkeletonList count={5} />
    </div>
  );
}
