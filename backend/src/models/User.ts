import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { UserRole } from "../constants/roles.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  section?: string;
  branch?: string;
  cgpa?: number;
  backlogCount?: number;
  resumeUrl?: string;       // Cloudinary secure URL
  resumePublicId?: string;  // Cloudinary public_id for deletion
  companyId?: Types.ObjectId | null; // for hr role — links to Company
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ["tpo", "hr", "student"],
    },
    department: { type: String, trim: true },
    section: { type: String, trim: true },
    branch: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 10 },
    backlogCount: { type: Number, min: 0, default: 0 },
    resumeUrl: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", default: null },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
