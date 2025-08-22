import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
//? Paginate = break big data into smaller chunks (pages) so you can fetch, display, and manage it easily.
//! Paginate Aggregation
// Now imagine you don’t want to load all 10,000 videos at once.
// You want:
// Page 1 → 10 videos
// Page 2 → next 10 videos
// Page 3 → next 10 videos
// …and so on.
//* 👉 Paginate aggregation = splitting the result of an aggregation pipeline into pages.
const videoSchema = new Schema(
  {
    videoFile:
    {
      type:String,//cloudinary url
      required:true,
    },
    thumbnail:
    {
        type:String,//cloudinary url
        required:true,
    },
    title:
    {
        type:String,//cloudinary url
        required:true,
    },
    discription:
    {
        type:String,//cloudinary url
        required:true,
    },
    duration:
    {
        type:Number,//cloudinary url
        required:true,
    },
    views:
    {
        type:Number,
        default:0
    },
    isPublished:
    {
        type:Boolean,
        default:true
    },
    owner:
    {
        type:Schema.Types.ObjectId,
        ref:"User"

    }
  },
  {
    timestamps: true,
  }
);
videoSchema.plugin(mongooseAggregatePaginate);
// A plugin is like an add-on or extension you attach to a Mongoose Schema.
// It adds extra functionality to your models without you writing the logic from scratch.
export const Video = mongoose.model("Video", videoSchema);
