import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") redirect("/login");
  if (session.user.status === "SUSPENDED") redirect("/suspended");

  const isPending = session.user.status === "PENDING_APPROVAL";

  return (
    <div className="min-h-screen bg-[--color-bg]">
      {isPending && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          ⏳ Your company account is awaiting SuperAdmin approval. You cannot post jobs yet.
        </div>
      )}
      <main className="page-container py-8">{children}</main>
    </div>
  );
}
