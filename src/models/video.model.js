import mongoose, { Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = Schema({
  videoFile: {
    type: String,
    required: true,
    
  },
  thumbnail: {
    type: String,
    required: true,

  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    requir: true,
  },
  title: {
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  views:{
    type: Number,
    // required: true,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true
  }
},
{
  timeStamp: true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)