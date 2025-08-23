// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

// Upload from URL
 const uploadFromUrl = async (imageUrl, publicId) => {
  try {
    const response = await cloudinary.uploader.upload(imageUrl, {
        resource_type:"auto",
      public_id: publicId,
    });
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Upload from local file (temporary path in server, e.g. from multer)
 const uploadFromLocal = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // remove file after upload
    console.log("file uploaded on cloudinary on url ",response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);//removes the locally saved temporary file as the upload operation got failed
    console.error("Cloudinary upload error:", error);
    throw null;
  }
};
export {uploadFromUrl,uploadFromLocal};