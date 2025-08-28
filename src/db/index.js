import mongoose, { connect } from "mongoose";

import { DB_NAME } from "../constents.js";

const connectDB = async () => {
  try {
    const connectioninstence = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`MongoDB connected : conection host : ${connectioninstence.connection.host}`);
  } catch (err) {
    console.log("ERROR: in connection DB : ",err);
    process.exit(1)
  }
};


export default connectDB;