import mongoose, { Schema, STATES } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const schema  = new Schema(
  {
  content: {
    type: String,
    require: true,

  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true
  }

  },
  {
    timestamps: true
  }
)

schema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", schema);