import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ApplicationStatus = "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  seekerId: Types.ObjectId;
  status: ApplicationStatus;
  message: string;       // company review message
  coverLetter: string;   // seeker's cover letter on apply
  phone: string;         // seeker's contact phone
  resumeUrl: string;     // uploaded resume URL
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "APPROVED", "REJECTED"] as ApplicationStatus[],
      default: "PENDING",
    },
    message: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    phone: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Enforce one application per seeker per job
ApplicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
ApplicationSchema.index({ seekerId: 1, status: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application ??
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
