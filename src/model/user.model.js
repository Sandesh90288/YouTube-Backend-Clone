import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary image
      required: true,
    },
    coverImage: {
      type: String, //cloudinary image
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
//! When you write a Mongoose middleware (hook) like:
//* userSchema.pre("save", function () {
//     // some logic
//   });
//? you should NOT use an arrow function Because in Mongoose middleware, this refers to the current document being saved.
  // for encryption it requires time so we use async function in below
userSchema.pre("save", async function(next){
    if (this.isModified("password")) {
        this.password=await bcrypt.hash(this.password,10);//10 is no of hash round
    }
    next();  
});
userSchema.methods.isPasswordCorrect=async function(password){
   return  await bcrypt.compare(password,this.password);
}
//!why u are using this
// 🔹 Why this is important here
//? Imagine you fetch a user during login:
//* const user = await User.findOne({ email: "test@gmail.com" });
// Now user.password = hashed password stored in DB, e.g.
//? $2b$10$WQJ4u3g...
// When someone tries to log in with "mypassword123", you need to check:
// 👉 Does "mypassword123" match the hashed password in the DB?
// That’s what your method does:
// *const isMatch = await user.isPasswordCorrect("mypassword123");
// Inside the method:
// bcrypt.compare("mypassword123", this.password);
// Here, this.password = the hash stored in that specific user document.

userSchema.methods.generateAccessToken=async function(){
   return jwt.sign({
        _id:this._id,
        _email:this.email,
        _username:this.username
    },process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn:ACCESS_TOKEN_EXPIRY
    })
 }
userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn:REFRESH_TOKEN_EXPIRY
    })
 }
export const User = mongoose.model("User", userSchema);
