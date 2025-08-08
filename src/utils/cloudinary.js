import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { APIerror } from '../utils/APIerror.js';

// ye code surver se file ko cloud pe uplode kar dega

async function uplodeFileOnCloudinary(localfilePath) {

  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
  });

  // Upload an image
  console.log("cloudinery",localfilePath)


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


 async function deleteFileOnCloudniry (url, resource_type = "image") {

    // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
  });


  //https://res.cloudinary.com/dixsg9gz0/image/upload/v1754142170/w7cbi2fpfcwys7k9tvdv.jpg
  try {
    const publicId = url.split('/').pop().split('.')[0];
    console.log(publicId);
    if(!publicId){
      throw new APIerror(409, "public id not found in deleting url");
    }
  
    const result = await cloudinary.uploader.destroy(publicId,{resource_type});
    console.log(result);
    return result;
  
  } catch (error) {
    throw new APIerror(478, "old file not deleted on cloudinery somthin went wrong")
  }
}

export { uplodeFileOnCloudinary, deleteFileOnCloudniry }


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