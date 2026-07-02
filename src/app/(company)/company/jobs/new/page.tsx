import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PostJobForm from "@/components/jobs/PostJobForm";
import { createJob } from "@/actions/jobs";

export default async function NewJobPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.status !== "ACTIVE") redirect("/company/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl">
        <PostJobForm action={createJob} submitLabel="Post Job" />
      </div>
    </div>
  );
}
