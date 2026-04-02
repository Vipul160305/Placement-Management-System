import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface IApplication extends Document {
  student: Types.ObjectId;
  drive: Types.ObjectId;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    drive: { type: Schema.Types.ObjectId, ref: "Drive", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "offered", "rejected", "withdrawn"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, drive: 1 }, { unique: true });
applicationSchema.index({ drive: 1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);
