import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICompanyFollow extends Document {
  seekerId: Types.ObjectId;
  companyId: Types.ObjectId;
  createdAt: Date;
}

const CompanyFollowSchema = new Schema<ICompanyFollow>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

CompanyFollowSchema.index({ seekerId: 1, companyId: 1 }, { unique: true });
CompanyFollowSchema.index({ companyId: 1 });

const CompanyFollow: Model<ICompanyFollow> =
  mongoose.models.CompanyFollow ??
  mongoose.model<ICompanyFollow>("CompanyFollow", CompanyFollowSchema);

export default CompanyFollow;
