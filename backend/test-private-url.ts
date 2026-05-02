import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const privateUrl = cloudinary.utils.private_download_url(
  "placement-resumes/resume_69f4e800a49ea33f5314fe80",
  "pdf",
  { type: "upload", resource_type: "image" }
);

console.log(privateUrl);
