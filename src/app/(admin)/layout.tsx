import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") redirect("/login");

  return (
    <main className="page-container py-8">{children}</main>
  );
}
