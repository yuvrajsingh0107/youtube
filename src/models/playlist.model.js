import mongoose, { Schema } from "mongoose";


const schema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true
    },
    videos: [{
      type: Schema.Types.ObjectId,
      ref: "video",
      req: true
    }],
    discription: {
      type: String,
      require: true,
      trim: true
    },
    name: {
      type: String,
      req: true,
      trim: true
    }
  },{
    timestamps: true
  }
)

export const Playlist = mongoose.Model("Playlist", schema);