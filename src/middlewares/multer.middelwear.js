import multer from "multer";


// ye code vedio files ko surver pe uplode kar dega 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // is dir me file save hogi
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    // user ke diye hue name se save hogi
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })