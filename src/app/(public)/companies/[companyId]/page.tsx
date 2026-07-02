import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import CompanyProfile from "@/models/CompanyProfile";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyFollow from "@/models/CompanyFollow";
import Job from "@/models/Job";
import { auth } from "@/lib/auth";
import { matchScore } from "@/lib/matchScore";
import CompanyJobsList from "@/components/companies/CompanyJobsList";

interface CompanyProfilePageProps {
    params: Promise<{ companyId: string }>;
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
    const { companyId } = await params;

    await connectDB();

    // Ensure the company exists and is active
    const companyUser = await User.findOne({
        _id: companyId,
        role: "COMPANY",
        status: "ACTIVE",
        deletedAt: null,
    }).lean();

    if (!companyUser) notFound();

    // Retrieve company profile document
    const profile = await CompanyProfile.findOne({
        userId: companyId,
    }).lean();

    if (!profile) notFound();

    // Retrieve all active jobs posted by this company
    const jobs = await Job.find({
        companyId: companyId,
        status: "ACTIVE",
        deadline: { $gt: new Date() },
    })
        .sort({ createdAt: -1 })
        .lean();

    const session = await auth();
    const isSeeker = session?.user?.role === "JOBSEEKER";

    // Build the scored settings for jobs if seeker is logged in
    let scoredJobs: Array<{ job: any; score?: number }> = [];

    if (isSeeker) {
        const seekerProfile = await SeekerProfile.findOne({ userId: session.user.id }).lean();
        const follows = await CompanyFollow.find({ seekerId: session.user.id }).lean();
        const followedIds = new Set(follows.map((f) => f.companyId.toString()));

        if (seekerProfile) {
            const seekerInput = {
                skills: seekerProfile.skills,
                interests: seekerProfile.interests,
                experienceLevel: seekerProfile.experienceLevel,
                location: seekerProfile.location,
            };

            scoredJobs = jobs.map((job) => ({
                job,
                score: matchScore(
                    seekerInput,
                    {
                        companyId: job.companyId.toString(),
                        category: job.category,
                        skillsRequired: job.skillsRequired,
                        experienceLevel: job.experienceLevel,
                        location: job.location,
                        jobType: job.jobType,
                        createdAt: job.createdAt,
                    },
                    followedIds
                ),
            }));
        } else {
            scoredJobs = jobs.map((job) => ({ job }));
        }
    } else {
        scoredJobs = jobs.map((job) => ({ job }));
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                {/* Dynamic header design / banner */}
                <div className="h-44 bg-gradient-to-r from-teal-600 to-teal-700 w-full shadow-inner relative flex items-end">
                    <div className="max-w-7xl mx-auto px-6 w-full flex justify-between pb-4">
                        <Link
                            href="/"
                            className="absolute top-4 left-6 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur transition"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>

                {/* Profile Details Container */}
                <div className="max-w-7xl mx-auto px-6 -mt-16 pb-12 relative z-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm font-bold text-teal-700 shrink-0 select-none">
                                    {profile.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                        {profile.companyName}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        {profile.industry ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                                                {profile.industry}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-150 text-gray-500">
                                                General Industry
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                            Verified Partner ✓
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5 shrink-0">
                                {profile.website ? (
                                    <a
                                        href={
                                            profile.website.startsWith("http")
                                                ? profile.website
                                                : `https://${profile.website}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition flex items-center gap-2"
                                    >
                                        <span>Visit website url</span>
                                        <span>↗</span>
                                    </a>
                                ) : (
                                    <span className="px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold text-gray-400">
                                        No Website URL
                                    </span>
                                )}
                                <a
                                    href={`mailto:${companyUser.email}`}
                                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 rounded-xl text-sm font-semibold text-white transition flex items-center gap-1.5"
                                >
                                    ✉ Contact Us
                                </a>
                            </div>
                        </div>

                        {/* Description & Overview Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                                        About {profile.companyName}
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                        {profile.description ||
                                            "This company details are private or no bio description was added yet."}
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar Info Card */}
                            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-5 space-y-4">
                                <h3 className="font-bold text-gray-950 text-sm">Overview</h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Contact Email</span>
                                        <span className="text-sm font-medium text-gray-700 break-all select-all">
                                            {companyUser.email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block">Member Since</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {new Date(companyUser.createdAt).toLocaleDateString(undefined, {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                <div className="max-w-7xl mx-auto px-6 pb-24">
                    <CompanyJobsList
                        initialJobs={scoredJobs}
                        companyName={profile.companyName}
                        isSeeker={isSeeker}
                    />
                </div>
            </div>
        </main>
    );
}
