import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
  userName: {
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    trime: true
  }, 
  fullName: {
    required: true,
    type: String,
    trime: true,
  },
  avatar: {
    type: String, // URL to some image
  },
  coverImage: {
    type: String, // URL to some image
  },
  password: {
    type: String,
    required: [true, "password is required"]
  },
  refreshToken: {
    type: String
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,

  }]

},
  { timeStamp: true }
);


// this is preehook in mongoose execute before the data save event in db
// note : do not use () => {} arrow function becouse we need this refrence in this plugin
userSchema.pre("save", async function (next) {
  if (this.isModified('password')) {
    //if passwored id modified then encrypt the password
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
})

// creating a method in schema to check passowrd is currect or not
userSchema.methods.isPasswordCorrect = async function (password) {
  // bcrypt provide compare method to check password
  console.log(password);
  return await bcrypt.compare(password, this.password)
}


// hear we genrated access token
userSchema.methods.genrateAssessToken = async function () {
  return  jwt.sign({
    _id: this._id,
    userName: this.userName,
    email: this.email
  },
  process.env.ACCESS_TOKEN_SECRET
  , {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
)
}


// hear we genrated refresh  token
userSchema.methods.genrateRefreshToken = async function () { 
  return  jwt.sign({
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET
    , {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}



export const User = mongoose.model('User', userSchema);
// this user will be saved as users (small and prural)