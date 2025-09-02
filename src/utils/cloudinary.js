// src/utils/cloudinary.js
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ensure env variables are loaded

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug log (optional, remove in production)
console.log("✅ Cloudinary Config Loaded:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// ==========================
// Upload from URL
// ==========================
const uploadFromUrl = async (imageUrl, publicId) => {
  try {
    const response = await cloudinary.uploader.upload(imageUrl, {
      resource_type: "auto",
      public_id: publicId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// ==========================
// Upload from Local File
// (e.g. file saved temporarily by multer)
// ==========================
const uploadFromLocal = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove file after successful upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Ensure temp file is removed even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error; // never throw null
  }
};

export { uploadFromUrl, uploadFromLocal };
