import mongoose, { Document, Model, Schema, Types } from "mongoose";
import type { ExperienceLevel } from "./SeekerProfile";

export type JobType = "REMOTE" | "ONSITE" | "HYBRID";
export type JobStatus = "ACTIVE" | "EXPIRED" | "CLOSED";

export interface IJob extends Document {
  companyId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  location: string;
  jobType: JobType;
  deadline: Date;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"] as ExperienceLevel[],
      required: true,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ["REMOTE", "ONSITE", "HYBRID"] as JobType[],
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CLOSED"] as JobStatus[],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast "active, non-expired" queries (seeker feed)
JobSchema.index({ deadline: 1, status: 1 });
JobSchema.index({ companyId: 1, status: 1 });
JobSchema.index({ category: 1 });

const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default Job;
