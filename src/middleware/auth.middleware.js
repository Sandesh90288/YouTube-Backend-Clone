import {asynchandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import {User} from "../model/user.model.js"
import {ApiError} from "../utils/apiError.js"
// _ is means blank as req is blank so i used in below;
 const verifyJWT= asynchandler(async(req, _,next)=>
{
 try {
       const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ", "");
       //! req.header("Authorization")?.replace("Bearer ", "") 
       // Use: It takes the token from the Authorization header.
       //  The client sends a header like:
       //Authorization: Bearer abc123xyz
      // This code removes "Bearer " and keeps only the token:
      // abc123xyz
   //!     req.header.Authorization?.replace("Bearer ", "") why can we write like this 
   // You cannot write:
   // ```js
   // req.header.Authorization?.replace("Bearer ", "")
   // ```
   // because:
   // * `req.header` is **a function**, not an object.
   // * You must **call** it like `req.header("Authorization")`.
   // Think of it like this 👇
   // ```js
   // req.header("Authorization")   // ✅ function call → gives you header value
   // req.header.Authorization     // ❌ wrong → you are treating header like an object
   // ```
   // So the only correct way is:
   // ```js
   // req.header("Authorization")?.replace("Bearer ", "")
   // ```
   // 👉 This means:
   // 1. Call `req.header("Authorization")` → gives `"Bearer abc123xyz"` (string).
   // 2. Use `?.replace("Bearer ", "")` → safely remove `"Bearer "` → leaves `"abc123xyz"`.
   // ---
   // Would you like me to show how this looks in a real `req.headers` object so it’s more clear?
    if (!token) {
       throw new ApiError("404","Unauthorized request");
    }

    console.log("Generated Tokens:", token);


     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user=await User.findById(decodedToken?._id).select("-password -refreshtoken");
     if(!user)
     {
       throw new ApiError("401","Invalid Access Token");
     }
     req.user=user;
     next();
 } catch (error) {
    throw new ApiError("401",error?.message||"Invalid access token");
 }

});
export {verifyJWT}