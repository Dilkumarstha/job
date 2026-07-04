export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-gray-200 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-40 bg-gray-200 rounded-xl" />
          <div className="h-9 w-44 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-2xl" />
        ))}
      </div>

      {/* chart rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-80 bg-gray-100 rounded-2xl" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-80 bg-gray-100 rounded-2xl" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="h-96 bg-gray-100 rounded-2xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}
