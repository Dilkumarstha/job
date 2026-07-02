import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ExperienceLevel = "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";

export interface ISeekerProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  bio: string;
  resumeUrl: string;
  experienceLevel: ExperienceLevel;
  location: string;
  skills: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SeekerProfileSchema = new Schema<ISeekerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    experienceLevel: {
      type: String,
      enum: ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"] as ExperienceLevel[],
    },
    location: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SeekerProfile: Model<ISeekerProfile> =
  mongoose.models.SeekerProfile ??
  mongoose.model<ISeekerProfile>("SeekerProfile", SeekerProfileSchema);

export default SeekerProfile;
