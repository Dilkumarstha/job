import { SkeletonList } from "@/components/ui/Skeleton";
export default function JobsLoading() {
  return <div><div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" /><SkeletonList count={4} /></div>;
}
