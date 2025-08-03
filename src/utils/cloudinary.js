import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// ye code surver se file ko cloud pe uplode kar dega

async function uplodeFileOnCloudinary(localfilePath) {

  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
  });

  // Upload an image
  // console.log("cloudinery",localfilePath)


  // console.log("cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
  // console.log("api_key:", process.env.CLOUDINARY_API_KEY);
  // console.log("api_secret:", process.env.CLOUDINARY_API_SECRET);
  // console.log("Cloudinary config:", cloudinary.config());
  try {
    if (!localfilePath) return null;
    // uplode file of given path
    const result = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto"
    });
    // file has been uploded successfully
    // console.log("file uploded sucessfully on coludinury"+ res.url);
    fs.unlinkSync(localfilePath);
    return result;
  } catch (error) {
    // the file is present in our surver if it fails to uplode then we need to remove from our surver before re trying 
    fs.unlinkSync(localfilePath);
    // console.log("ERROR : " ,error)
    return null;
  }

};

export { uplodeFileOnCloudinary }


/*
  import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key:    process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uplodeFileOnCloudinary = async (localPath) => {
try {
  if (!localPath) return null;

  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: "auto",
  });

  // optional: delete local file after upload
  fs.unlinkSync(localPath);

  return result;
} catch (error) {
  console.error("Cloudinary Upload Error:", error);
  return null;
}
};


*/