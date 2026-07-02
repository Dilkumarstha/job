import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuspendedPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.status !== "SUSPENDED") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Suspended
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been suspended by an administrator. You cannot access
          HireHub at this time.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
          <p className="text-sm font-medium text-red-700">
            Contact support if you believe this is a mistake.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="px-6 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
