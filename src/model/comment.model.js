import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const commentSechema = new Schema({
content:
{
    required:true,
    type:String,
},
video:
{
    type:Schema.Types.ObjectId,
    ref:"Video"
},
owner:
{
    type:Schema.Types.ObjectId,
    ref:"User"
},

},{
    timestamps:true
})

commentSechema.plugin(mongooseAggregatePaginate);
export const Comments=mongoose.model("Comment",commentSechema);