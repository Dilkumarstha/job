/**
 * HireHub Seed Script
 * Run with: npm run seed
 *
 * Creates:
 *  - 1 SuperAdmin
 *  - 3 Companies (2 approved, 1 pending)
 *  - 10 JobSeekers with profiles
 *  - 15 Jobs (mix of active / expired / closed)
 *  - 20 Applications
 *  - 10 SavedJobs
 *  - 5 CompanyFollows
 *
 * Idempotent: skips records that already exist.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── inline model definitions (avoid Next.js server-only imports) ──────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set. Add it to .env.local");
  process.exit(1);
}
// TypeScript: narrow to string after the guard above
const MONGO_URI: string = MONGODB_URI;

// Re-use models if already compiled (ts-node / tsx re-runs)
const User =
  mongoose.models.User ??
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: String,
        role: { type: String, enum: ["SUPERADMIN", "JOBSEEKER", "COMPANY"] },
        status: {
          type: String,
          enum: ["ACTIVE", "SUSPENDED", "PENDING_APPROVAL"],
          default: "ACTIVE",
        },
        suspendedUntil: { type: Date, default: null },
        suspendedReason: { type: String, default: null },
        deletedAt: { type: Date, default: null },
      },
      { timestamps: true }
    )
  );

const SeekerProfile =
  mongoose.models.SeekerProfile ??
  mongoose.model(
    "SeekerProfile",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
        fullName: String,
        bio: String,
        resumeUrl: { type: String, default: "" },
        experienceLevel: String,
        location: String,
        skills: [String],
        interests: [String],
      },
      { timestamps: true }
    )
  );

const CompanyProfile =
  mongoose.models.CompanyProfile ??
  mongoose.model(
    "CompanyProfile",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
        companyName: String,
        description: String,
        logoUrl: { type: String, default: "" },
        industry: String,
        website: String,
        verified: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const Job =
  mongoose.models.Job ??
  mongoose.model(
    "Job",
    new mongoose.Schema(
      {
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        title: String,
        description: String,
        category: String,
        skillsRequired: [String],
        experienceLevel: String,
        salaryMin: Number,
        salaryMax: Number,
        location: String,
        jobType: String,
        deadline: Date,
        status: { type: String, enum: ["ACTIVE", "EXPIRED", "CLOSED"], default: "ACTIVE" },
      },
      { timestamps: true }
    )
  );

const Application =
  mongoose.models.Application ??
  mongoose.model(
    "Application",
    new mongoose.Schema(
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["PENDING", "REVIEWED", "APPROVED", "REJECTED"], default: "PENDING" },
        message: { type: String, default: "" },
        appliedAt: { type: Date, default: Date.now },
      },
      { timestamps: true }
    )
  );

const SavedJob =
  mongoose.models.SavedJob ??
  mongoose.model(
    "SavedJob",
    new mongoose.Schema(
      {
        seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      },
      { timestamps: { createdAt: true, updatedAt: false } }
    )
  );

const CompanyFollow =
  mongoose.models.CompanyFollow ??
  mongoose.model(
    "CompanyFollow",
    new mongoose.Schema(
      {
        seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
      { timestamps: { createdAt: true, updatedAt: false } }
    )
  );

// ── helpers ───────────────────────────────────────────────────────────────────
const hash = (p: string) => bcrypt.hash(p, 12);
const future = (days: number) => new Date(Date.now() + days * 86_400_000);
const past = (days: number) => new Date(Date.now() - days * 86_400_000);

async function upsertUser(email: string, data: object) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ email, ...data });
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  // Reset collections to ensure fresh matching fields
  await Application.deleteMany({});
  console.log("🧹  Cleared existing applications database");

  // ── 1. SuperAdmin ─────────────────────────────────────────────────────────────
  console.log("\n🌱  Seeding SuperAdmin…");
  const admin = await upsertUser("admin@hirehub.local", {
    passwordHash: await hash("Admin123!"),
    role: "SUPERADMIN",
    status: "ACTIVE",
  });
  console.log(`   admin@hirehub.local (${admin._id})`);

  // ── 2. Companies ──────────────────────────────────────────────────────────────
  console.log("\n🌱  Seeding Companies…");
  const companyData = [
    { email: "talent@techcorp.io", name: "TechCorp", industry: "Technology", status: "ACTIVE", verified: true },
    { email: "hr@designstudio.com", name: "Design Studio", industry: "Design", status: "ACTIVE", verified: true },
    { email: "jobs@startupxyz.co", name: "StartupXYZ", industry: "Finance", status: "PENDING_APPROVAL", verified: false },
  ];

  const companyUsers: mongoose.Document[] = [];
  for (const c of companyData) {
    const u = await upsertUser(c.email, {
      passwordHash: await hash("Company123!"),
      role: "COMPANY",
      status: c.status,
    });
    companyUsers.push(u);
    const exists = await CompanyProfile.findOne({ userId: u._id });
    if (!exists) {
      await CompanyProfile.create({
        userId: u._id,
        companyName: c.name,
        description: `${c.name} is a leading company in ${c.industry}.`,
        industry: c.industry,
        website: `https://${c.email.split("@")[1]}`,
        verified: c.verified,
      });
    }
    console.log(`   ${c.email} — ${c.status}`);
  }

  // ── 3. JobSeekers ─────────────────────────────────────────────────────────────
  console.log("\n🌱  Seeding JobSeekers…");
  const seekerData = [
    { name: "Alice Chen", email: "alice@example.com", level: "MID", location: "San Francisco", skills: ["React", "TypeScript", "Node.js"], interests: ["Engineering", "Product"] },
    { name: "Bob Martinez", email: "bob@example.com", level: "JUNIOR", location: "New York", skills: ["Python", "Django", "PostgreSQL"], interests: ["Engineering", "Data & Analytics"] },
    { name: "Carol Smith", email: "carol@example.com", level: "SENIOR", location: "London", skills: ["Figma", "UX Research", "Sketch"], interests: ["Design"] },
    { name: "David Lee", email: "david@example.com", level: "ENTRY", location: "Remote", skills: ["JavaScript", "HTML", "CSS"], interests: ["Engineering", "Writing & Content"] },
    { name: "Eva Johnson", email: "eva@example.com", level: "LEAD", location: "Berlin", skills: ["Go", "Kubernetes", "Docker"], interests: ["Engineering", "Operations"] },
    { name: "Frank Kim", email: "frank@example.com", level: "MID", location: "Toronto", skills: ["React", "GraphQL", "AWS"], interests: ["Engineering", "Product"] },
    { name: "Grace Wu", email: "grace@example.com", level: "SENIOR", location: "Singapore", skills: ["Data Science", "Python", "ML"], interests: ["Data & Analytics", "Research"] },
    { name: "Henry Park", email: "henry@example.com", level: "JUNIOR", location: "Austin", skills: ["Vue.js", "CSS", "Tailwind"], interests: ["Engineering", "Design"] },
    { name: "Iris Thompson", email: "iris@example.com", level: "MID", location: "Sydney", skills: ["Product Management", "Agile"], interests: ["Product", "Operations"] },
    { name: "Jack Wilson", email: "jack@example.com", level: "ENTRY", location: "Chicago", skills: ["Marketing", "SEO", "Content"], interests: ["Marketing", "Writing & Content"] },
  ];

  const seekerUsers: mongoose.Document[] = [];
  for (const s of seekerData) {
    const u = await upsertUser(s.email, {
      passwordHash: await hash("Seeker123!"),
      role: "JOBSEEKER",
      status: "ACTIVE",
    });
    seekerUsers.push(u);
    const exists = await SeekerProfile.findOne({ userId: u._id });
    if (!exists) {
      await SeekerProfile.create({
        userId: u._id,
        fullName: s.name,
        bio: `Experienced ${s.level.toLowerCase()} professional based in ${s.location}.`,
        experienceLevel: s.level,
        location: s.location,
        skills: s.skills,
        interests: s.interests,
      });
    }
    console.log(`   ${s.email}`);
  }

  // ── 4. Jobs ───────────────────────────────────────────────────────────────────
  console.log("\n🌱  Seeding Jobs…");
  const [techCorp, designStudio] = companyUsers;
  const jobDefs = [
    // TechCorp active jobs
    { title: "Senior Frontend Engineer", company: techCorp._id, cat: "Engineering", skills: ["React", "TypeScript", "CSS"], level: "SENIOR", loc: "San Francisco", type: "HYBRID", deadline: future(30), status: "ACTIVE" },
    { title: "Full Stack Developer", company: techCorp._id, cat: "Engineering", skills: ["Node.js", "React", "MongoDB"], level: "MID", loc: "Remote", type: "REMOTE", deadline: future(20), status: "ACTIVE" },
    { title: "DevOps Engineer", company: techCorp._id, cat: "Engineering", skills: ["Docker", "Kubernetes", "AWS"], level: "SENIOR", loc: "New York", type: "ONSITE", deadline: future(45), status: "ACTIVE" },
    { title: "Data Scientist", company: techCorp._id, cat: "Data & Analytics", skills: ["Python", "ML", "TensorFlow"], level: "MID", loc: "Remote", type: "REMOTE", deadline: future(15), status: "ACTIVE" },
    { title: "Product Manager", company: techCorp._id, cat: "Product", skills: ["Product Management", "Agile"], level: "SENIOR", loc: "San Francisco", type: "HYBRID", deadline: future(25), status: "ACTIVE" },
    // DesignStudio active jobs
    { title: "UX/UI Designer", company: designStudio._id, cat: "Design", skills: ["Figma", "UX Research", "Sketch"], level: "MID", loc: "London", type: "HYBRID", deadline: future(40), status: "ACTIVE" },
    { title: "Brand Designer", company: designStudio._id, cat: "Design", skills: ["Illustrator", "Photoshop", "Figma"], level: "JUNIOR", loc: "Remote", type: "REMOTE", deadline: future(35), status: "ACTIVE" },
    { title: "Motion Designer", company: designStudio._id, cat: "Design", skills: ["After Effects", "Cinema 4D"], level: "MID", loc: "London", type: "ONSITE", deadline: future(50), status: "ACTIVE" },
    // TechCorp closed job
    { title: "Backend Engineer (Go)", company: techCorp._id, cat: "Engineering", skills: ["Go", "PostgreSQL", "Redis"], level: "SENIOR", loc: "Berlin", type: "REMOTE", deadline: future(10), status: "CLOSED" },
    // Expired jobs
    { title: "Junior React Developer", company: techCorp._id, cat: "Engineering", skills: ["React", "JavaScript", "CSS"], level: "ENTRY", loc: "Austin", type: "REMOTE", deadline: past(5), status: "EXPIRED" },
    { title: "Marketing Specialist", company: designStudio._id, cat: "Marketing", skills: ["SEO", "Content", "Google Ads"], level: "MID", loc: "New York", type: "ONSITE", deadline: past(10), status: "EXPIRED" },
    { title: "Sales Development Rep", company: techCorp._id, cat: "Sales", skills: ["CRM", "Cold Calling", "Salesforce"], level: "ENTRY", loc: "Chicago", type: "ONSITE", deadline: past(3), status: "EXPIRED" },
    { title: "Content Writer", company: designStudio._id, cat: "Writing & Content", skills: ["Copywriting", "SEO", "WordPress"], level: "JUNIOR", loc: "Remote", type: "REMOTE", deadline: past(8), status: "EXPIRED" },
    { title: "Customer Success Manager", company: techCorp._id, cat: "Customer Support", skills: ["CRM", "Communication", "Zendesk"], level: "MID", loc: "Toronto", type: "HYBRID", deadline: past(2), status: "EXPIRED" },
    { title: "HR Generalist", company: designStudio._id, cat: "Human Resources", skills: ["HRIS", "Recruiting", "Onboarding"], level: "MID", loc: "London", type: "ONSITE", deadline: past(15), status: "EXPIRED" },
  ];

  const jobs: mongoose.Document[] = [];
  for (const j of jobDefs) {
    const exists = await Job.findOne({ title: j.title, companyId: j.company });
    if (exists) {
      jobs.push(exists);
    } else {
      const job = await Job.create({
        companyId: j.company,
        title: j.title,
        description: `We are looking for a talented ${j.title} to join our team. You will work on exciting projects and grow professionally.`,
        category: j.cat,
        skillsRequired: j.skills,
        experienceLevel: j.level,
        salaryMin: 60000,
        salaryMax: 120000,
        location: j.loc,
        jobType: j.type,
        deadline: j.deadline,
        status: j.status,
      });
      jobs.push(job);
    }
    console.log(`   ${j.title} — ${j.status}`);
  }

  // ── 5. Applications (20) ──────────────────────────────────────────────────────
  console.log("\n🌱  Seeding Applications…");
  const activeJobs = jobs.filter((j: mongoose.Document) => {
    const doc = j as mongoose.Document & { status: string };
    return doc.status === "ACTIVE";
  });

  const appPairs: Array<[mongoose.Document, mongoose.Document]> = [
    [seekerUsers[0], activeJobs[0]],
    [seekerUsers[0], activeJobs[1]],
    [seekerUsers[1], activeJobs[0]],
    [seekerUsers[1], activeJobs[3]],
    [seekerUsers[2], activeJobs[5]],
    [seekerUsers[2], activeJobs[6]],
    [seekerUsers[3], activeJobs[1]],
    [seekerUsers[3], activeJobs[4]],
    [seekerUsers[4], activeJobs[2]],
    [seekerUsers[4], activeJobs[0]],
    [seekerUsers[5], activeJobs[1]],
    [seekerUsers[5], activeJobs[4]],
    [seekerUsers[6], activeJobs[3]],
    [seekerUsers[7], activeJobs[5]],
    [seekerUsers[7], activeJobs[6]],
    [seekerUsers[8], activeJobs[4]],
    [seekerUsers[9], activeJobs[1]],
    [seekerUsers[9], activeJobs[3]],
    [seekerUsers[0], activeJobs[7]],
    [seekerUsers[2], activeJobs[7]],
  ];

  const statuses = ["PENDING", "REVIEWED", "APPROVED", "REJECTED"];
  let appCount = 0;
  for (const [seeker, job] of appPairs) {
    const exists = await Application.findOne({ jobId: job._id, seekerId: seeker._id });
    if (!exists) {
      await Application.create({
        jobId: job._id,
        seekerId: seeker._id,
        status: statuses[appCount % statuses.length],
        message: appCount % 4 >= 2 ? "Thank you for applying. We reviewed your profile carefully." : "",
        appliedAt: past(appCount),
        phone: `+1 (555) 019-${1000 + appCount}`,
        coverLetter: `Dear Hiring Team,\n\nI am writing to express my strong interest in target role. I believe my skills and professional background align perfectly with the requirements of this role. I have hands-on experience with modern tech stacks, and I look forward to carrying this expertise to benefit your organization.\n\nBest regards,\nApplicant`,
        resumeUrl: `/uploads/resumes/sample-${appCount % 3}.pdf`,
      });
      appCount++;
    }
  }
  console.log(`   ${appCount} new applications created`);

  // ── 6. SavedJobs (10) ─────────────────────────────────────────────────────────
  console.log("\n🌱  Seeding SavedJobs…");
  const savedPairs = [
    [seekerUsers[0], activeJobs[2]],
    [seekerUsers[0], activeJobs[4]],
    [seekerUsers[1], activeJobs[1]],
    [seekerUsers[2], activeJobs[0]],
    [seekerUsers[3], activeJobs[5]],
    [seekerUsers[4], activeJobs[3]],
    [seekerUsers[5], activeJobs[6]],
    [seekerUsers[6], activeJobs[0]],
    [seekerUsers[7], activeJobs[4]],
    [seekerUsers[8], activeJobs[2]],
  ];

  let savedCount = 0;
  for (const [seeker, job] of savedPairs) {
    const exists = await SavedJob.findOne({ seekerId: seeker._id, jobId: job._id });
    if (!exists) {
      await SavedJob.create({ seekerId: seeker._id, jobId: job._id });
      savedCount++;
    }
  }
  console.log(`   ${savedCount} new saved jobs created`);

  // ── 7. CompanyFollows (5) ─────────────────────────────────────────────────────
  console.log("\n🌱  Seeding CompanyFollows…");
  const followPairs = [
    [seekerUsers[0], techCorp._id],
    [seekerUsers[1], techCorp._id],
    [seekerUsers[2], designStudio._id],
    [seekerUsers[3], techCorp._id],
    [seekerUsers[5], designStudio._id],
  ];

  let followCount = 0;
  for (const [seeker, company] of followPairs) {
    const exists = await CompanyFollow.findOne({ seekerId: seeker._id, companyId: company });
    if (!exists) {
      await CompanyFollow.create({ seekerId: seeker._id, companyId: company });
      followCount++;
    }
  }
  console.log(`   ${followCount} new follows created`);

  // ── Done ──────────────────────────────────────────────────────────────────────
  await mongoose.disconnect();
  console.log("\n✅  Seed complete!");
  console.log("\n   Default credentials:");
  console.log("   SuperAdmin → admin@hirehub.local / Admin123!");
  console.log("   Company   → talent@techcorp.io  / Company123!");
  console.log("   Seeker    → alice@example.com   / Seeker123!");
}

run().catch((err) => {
  console.error("❌  Seeding failed:", err);
  process.exit(1);
});
