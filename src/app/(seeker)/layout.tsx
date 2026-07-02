import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "JOBSEEKER") redirect("/login");
  if (session.user.status === "SUSPENDED") redirect("/suspended");

  return (
    <main className="page-container py-10">{children}</main>
  );
}
