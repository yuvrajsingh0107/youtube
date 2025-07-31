import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

// ye code surver se file ko cloud pe uplode kar dega

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

async function uplodeFileOnCloudinary(localfilePath) {
  // Upload an image
  try {
    if(!localfilePath) return null;
    // uplode file of given path
    const res = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto"
    })
    // file has been uploded successfully
    console.log("file uploded sucessfully on coludinury"+ res.url);
    return res;
  } catch (error) {
    // the file is present in our surver if it fails to uplode then we need to remove from our surver before re trying 
    fs.unlinkSync(localfilePath);
    return null;
  }

    
    
  };

  export {uplodeFileOnCloudinary}
 