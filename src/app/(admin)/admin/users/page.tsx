import { listUsers, suspendUser, reactivateUser, softDeleteUser } from "@/actions/admin";
import EmptyState from "@/components/ui/EmptyState";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface UsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string; page?: string }>;
}

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
};

const roleBadge: Record<string, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700",
  COMPANY: "bg-blue-100 text-blue-700",
  JOBSEEKER: "bg-gray-100 text-gray-600",
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const result = await listUsers({
    search: params.search,
    role: params.role,
    status: params.status,
    page,
  });

  if ("error" in result) return <p className="text-red-500">{result.error}</p>;

  const { users, total, totalPages } = result;

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      </AnimatedSection>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search by email…"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          name="role"
          defaultValue={params.role}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="ALL">All roles</option>
          <option value="JOBSEEKER">Job Seekers</option>
          <option value="COMPANY">Companies</option>
          <option value="SUPERADMIN">Admins</option>
        </select>
        <select
          name="status"
          defaultValue={params.status}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_APPROVAL">Pending</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition"
        >
          Search
        </button>
      </form>

      <p className="text-sm text-gray-500 mb-4">{total} user{total !== 1 ? "s" : ""}</p>

      {users.length === 0 ? (
        <EmptyState icon="👥" heading="No users found" subtext="Try adjusting your search filters." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id.toString()} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[user.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.status === "ACTIVE" && user.role !== "SUPERADMIN" && (
                          <form action={async (fd: FormData) => {
                            "use server";
                            await suspendUser(user._id.toString(), fd);
                          }} className="inline">
                            <input type="hidden" name="reason" value="Suspended by admin" />
                            <button type="submit" className="text-xs text-amber-600 hover:underline">
                              Suspend
                            </button>
                          </form>
                        )}
                        {user.status === "SUSPENDED" && (
                          <form action={async () => {
                            "use server";
                            await reactivateUser(user._id.toString());
                          }}>
                            <button type="submit" className="text-xs text-green-600 hover:underline">
                              Reactivate
                            </button>
                          </form>
                        )}
                        {user.role !== "SUPERADMIN" && (
                          <form action={async () => {
                            "use server";
                            await softDeleteUser(user._id.toString());
                          }}>
                            <button type="submit" className="text-xs text-red-600 hover:underline">
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`?page=${page - 1}&search=${params.search ?? ""}&role=${params.role ?? ""}&status=${params.status ?? ""}`}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a href={`?page=${page + 1}&search=${params.search ?? ""}&role=${params.role ?? ""}&status=${params.status ?? ""}`}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
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
