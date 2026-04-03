import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface IProfileEditRequest extends Document {
  student: Types.ObjectId;
  changes: {
    name?: string;
    department?: string;
    section?: string;
    branch?: string;
    cgpa?: number;
    backlogCount?: number;
  };
  status: RequestStatus;
  reviewedBy?: Types.ObjectId | null;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileEditRequestSchema = new Schema<IProfileEditRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: {
      name:         { type: String, trim: true },
      department:   { type: String, trim: true },
      section:      { type: String, trim: true },
      branch:       { type: String, trim: true },
      cgpa:         { type: Number, min: 0, max: 10 },
      backlogCount: { type: Number, min: 0 },
    },
    status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);

profileEditRequestSchema.index({ student: 1, status: 1 });
profileEditRequestSchema.index({ status: 1, createdAt: -1 });

export const ProfileEditRequest: Model<IProfileEditRequest> =
  mongoose.model<IProfileEditRequest>("ProfileEditRequest", profileEditRequestSchema);
