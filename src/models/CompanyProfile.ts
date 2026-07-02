import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICompanyProfile extends Document {
  userId: Types.ObjectId;
  companyName: string;
  description: string;
  logoUrl: string;
  industry: string;
  website: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyProfile: Model<ICompanyProfile> =
  mongoose.models.CompanyProfile ??
  mongoose.model<ICompanyProfile>("CompanyProfile", CompanyProfileSchema);

export default CompanyProfile;
