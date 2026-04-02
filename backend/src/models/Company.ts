import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ICompany extends Document {
  name: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 1 });

export const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  companySchema
);
