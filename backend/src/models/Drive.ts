import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type DriveStatus = "draft" | "open" | "closed";

export interface ISectionAssignment {
  department: string;
  sections: string[];
}

export interface IDrive extends Document {
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description?: string;
  scheduledAt?: Date;
  minCgpa: number;
  maxBacklogs: number;
  allowedBranches: string[];
  jobRole?: string;
  package?: string;
  status: DriveStatus;
  sectionAssignments: ISectionAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

const sectionAssignmentSchema = new Schema<ISectionAssignment>(
  {
    department: { type: String, required: true, trim: true },
    sections: [{ type: String, trim: true }],
  },
  { _id: false }
);

const driveSchema = new Schema<IDrive>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scheduledAt: { type: Date },
    minCgpa: { type: Number, required: true, min: 0, max: 10, default: 0 },
    maxBacklogs: { type: Number, required: true, min: 0, default: 0 },
    allowedBranches: [{ type: String, trim: true }],
    jobRole: { type: String, trim: true },
    package: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "draft",
    },
    sectionAssignments: { type: [sectionAssignmentSchema], default: [] },
  },
  { timestamps: true }
);

driveSchema.index({ company: 1 });
driveSchema.index({ status: 1 });

export const Drive: Model<IDrive> = mongoose.model<IDrive>("Drive", driveSchema);
