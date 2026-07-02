import { getAuditLogs } from "@/actions/admin";
import EmptyState from "@/components/ui/EmptyState";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface AuditPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const result = await getAuditLogs(page, 30);

  if ("error" in result) return <p className="text-red-500">{result.error}</p>;

  const { logs, total, totalPages } = result;

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>
        <p className="text-sm text-gray-500 mb-4">{total} action{total !== 1 ? "s" : ""} recorded</p>
      </AnimatedSection>

      {logs.length === 0 ? (
        <EmptyState icon="📋" heading="No audit logs yet" subtext="Admin actions will be recorded here." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const admin = log.adminId as unknown as { email?: string };
                  const target = log.targetUserId as unknown as { email?: string } | null;

                  return (
                    <tr key={log._id.toString()} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{admin?.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{target?.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.reason || "—"}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`?page=${page - 1}`} className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a href={`?page=${page + 1}`} className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
