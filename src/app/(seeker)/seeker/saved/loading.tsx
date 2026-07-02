import { SkeletonList } from "@/components/ui/Skeleton";
export default function SavedLoading() {
  return <div><div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-6" /><SkeletonList count={3} /></div>;
}
