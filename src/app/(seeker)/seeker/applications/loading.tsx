import { SkeletonList } from "@/components/ui/Skeleton";
export default function ApplicationsLoading() {
  return <div><div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" /><SkeletonList count={4} /></div>;
}
