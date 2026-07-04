import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "SUPERADMIN" | "JOBSEEKER" | "COMPANY";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  suspendedUntil: Date | null;
  suspendedReason: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["SUPERADMIN", "JOBSEEKER", "COMPANY"] as UserRole[],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "PENDING_APPROVAL"] as UserStatus[],
      default: "ACTIVE",
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspendedReason: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient role+status queries
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ deletedAt: 1 });

// Prevent model re-compilation in hot-reload
const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
