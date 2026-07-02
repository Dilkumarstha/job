import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import PostJobForm from "@/components/jobs/PostJobForm";
import { updateJob } from "@/actions/jobs";

interface EditJobPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { jobId } = await params;
  await connectDB();

  const job = await Job.findOne({
    _id: jobId,
    companyId: session.user.id,
  }).lean();

  if (!job) redirect("/company/jobs");

  const updateJobWithId = updateJob.bind(null, jobId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl">
        <PostJobForm
          action={updateJobWithId}
          submitLabel="Save Changes"
          defaultValues={{
            title: job.title,
            description: job.description,
            category: job.category as never,
            skillsRequired: job.skillsRequired,
            experienceLevel: job.experienceLevel as never,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            location: job.location,
            jobType: job.jobType as never,
            deadline: new Date(job.deadline),
          }}
        />
      </div>
    </div>
  );
}
