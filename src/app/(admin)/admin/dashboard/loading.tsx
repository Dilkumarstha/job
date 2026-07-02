export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({length: 7}).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );
}
