import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISavedJob extends Document {
  seekerId: Types.ObjectId;
  jobId: Types.ObjectId;
  createdAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SavedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });
SavedJobSchema.index({ seekerId: 1 });

const SavedJob: Model<ISavedJob> =
  mongoose.models.SavedJob ??
  mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);

export default SavedJob;
