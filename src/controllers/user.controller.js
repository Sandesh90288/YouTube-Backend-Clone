import { asynchandler } from "../utils/asynchandler.js";
import  {ApiError} from '../utils/apiError.js';
import {User} from "../model/user.model.js"
import {uploadFromLocal} from "../utils/cloudinary.js"
import  {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";

const generateRefreshAndAccesstokens=async(userId)=>
{
   try {
      const user=await User.findById(userId);
     const accessToken=user.generateAccessToken();
     const refreshToken=user.generateRefreshToken();
     user.refreshtoken=refreshToken;
     await user.save({ validateBeforeSave: false });
     
//?   When you call user.save() in Mongoose:
// By default, Mongoose validates the document before saving it to the database.
// Validation checks things like:
// Required fields (required: true)
// Data types (number, string, etc.)
// Custom validators
// If any validation fails → it throws an error and doesn’t save.
// 🔹 What validateBeforeSave: false does
// It tells Mongoose:
// 👉 “Skip validation, just save this document as it is.”
// So even if required fields are missing, or types don’t match, Mongoose will not run validations before saving.
return {accessToken,refreshToken};
   } catch (error) {
      throw new ApiError(500,"something went wrong while generating refreshing and access token")
   }
}

const register = asynchandler(async (req,res) => {
   // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullname, password } = req.body;
    //* if (fullname==="") {
    //     throw new ApiError(400,"fullname is required")
    // }
    //!use below if else method
    if ([username,fullname,email,password].some((fields)=>
        {if (fields.trim()===""){return true}
      })) {
            throw new ApiError(400,"all fields are required");
        };
    const existedUser = await User.findOne({
        $or:[{username},{email}]
      });//find if user name or email already exist
      if(existedUser)
      {
        throw new ApiError(409,"username or email exist");
      }
     const avatarLocalPath=req.files?.avatar[0]?.path;
     let coverImageLocalPath;
     let coverImage;
     
     if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar File is required")
     } 
     if (req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0) {
      coverImageLocalPath=req.files.coverImage[0].path;
       coverImage=await uploadFromLocal(coverImageLocalPath);
     }
     const avatar=await uploadFromLocal(avatarLocalPath);
 
     if(!avatar)
     {
        throw new ApiError(400,"Avatar File is required")
     }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",//if there then return coverImage.url else return ""
        email,
        password,
        username:username.toLowerCase()
     })
     const usercreated=await User.findById(user._id).select(
        "-password -refreshtoken"
     );//remove password and refreshtoken and remain data store in usercreated
     if(!usercreated)
     {
        throw new ApiError(500,"something went wrong while registering user")
     }
      return res.status(201).json(
        new apiResponse(200,usercreated,"successful")
     ) 
    
});
const loginUser=asynchandler(async (req,res)=>
{
    //req.body=>data
    //check username or email
    //find user
    //password check
    //access and refresh token
    //send cookies
    const{email,password,username}=req.body;
    if(!email&&!username)
    {
      throw new ApiError(400,"username or email is required");
    }
   const user=await User.findOne(
      {
         $or:[{username},{email}]//find by either username or by email
      }
    );
    if(!user)
    {
      throw new ApiError(404,"user not found");
    }
    //! all the methods written in User schema are available user instance not in User model
   const  ispasswordvalid=await user.isPasswordCorrect(password);//?remove more detail on this function
   if(!ispasswordvalid)
      {
        throw new ApiError(401,"password invalid");
      }
   const {refreshToken,accessToken}=await generateRefreshAndAccesstokens(user._id);
  const loggineduser=  await User.findById(user._id).select("-password -refreshtoken");
//   This fetches the same user again,
// But this time you exclude sensitive fields (password, refreshToken).
// This is the safe version of the user you can return to the frontend.

//   If you return user directly in your API response, it will include:
// password (even if hashed, still sensitive ⚠️)
// refreshToken (VERY sensitive ⚠️, should never go to frontend)
// So you should not return user as-is.
  const options=
  {
   httpOnly:true,
   secure:true,
   // httpOnly: true → JavaScript can’t see the cookie, but the browser still uses it for requests.
//  httpOnly: true → “Frontend JS can’t read this cookie, only server/browser handle it.”
// secure: true → “Send this cookie only via HTTPS, not plain HTTP.”
  }
  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
   new apiResponse(200,
      {
         user:loggineduser,accessToken,refreshToken
      },
      "loggged in successfully"
   )
  )
//!  Why set cookies at all?
// Cookies are best for automatic authentication — the browser stores them and sends them with every request.
// That’s why refresh tokens (long-lived) are almost always stored in httpOnly cookies → safe from frontend JS.
});

const logoutUser=asynchandler(async(req,res)=>
{
 await User.findByIdAndUpdate(req.user._id,
   {
      $set:{
         refreshtoken: undefined,
      }
   },
   {
      new:true
   }
  );
  const options=
  {
   httpOnly:true,
   secure:true, 
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, {}, "User logged out successfully"));

});

/**
 * Refresh Access Token Controller
 * 
 * Purpose: Generate new access and refresh tokens when the current access token expires
 * 
 * Flow:
 * 1. Get refresh token from cookies or request body
 * 2. Verify the refresh token is valid and not expired
 * 3. Check if user still exists in database
 * 4. Verify refresh token matches what's stored in database (prevents token reuse)
 * 5. Generate new access and refresh tokens
 * 6. Set new tokens in cookies and return them
 * 
 * Security Features:
 * - Token signature verification
 * - Token expiration check
 * - User existence validation
 * - Token revocation check (prevents use of old tokens after logout)
 * - HttpOnly cookies (prevents XSS attacks)
 * - Secure cookies (HTTPS only)
 */
const refreshAccessToken = asynchandler(async (req, res) => {
    // Step 1: Extract refresh token from request
    // Priority: Cookie first (automatic), then request body (manual)
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    // Step 2: Validate refresh token exists
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request - No refresh token provided");
    }
    
    try {
        // Step 3: Verify refresh token signature and expiration
        // This will throw an error if token is:
        // - Tampered with (invalid signature)
        // - Expired (past exp timestamp)
        // - Malformed (invalid format)
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Step 4: Check if user still exists in database
        // This prevents use of tokens from deleted/suspended accounts
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token - User not found");
        }
        
        // Step 5: Verify refresh token matches what's stored in database
        // This prevents:
        // - Use of old tokens after logout (token revocation)
        // - Token reuse attacks
        // - Use of tokens from other sessions
        if (incomingRefreshToken !== user?.refreshtoken) {
            throw new ApiError(401, "Refresh token expired or used - Please login again");
        }
        
        // Step 6: Generate new access and refresh tokens
        // This creates a fresh set of tokens for the user
        const { accessToken, refreshToken } = await generateRefreshAndAccesstokens(user._id);
        
        // Step 7: Configure cookie options for security
        const options = {
            httpOnly: true,    // Prevents JavaScript access (XSS protection)
            secure: true,      // Only send over HTTPS (production security)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days persistence
        };
        
        // Step 8: Send response with new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)      // Set new access token cookie
            .cookie("refreshToken", refreshToken, options)   // Set new refresh token cookie
            .json(
                new apiResponse(200, 
                    { 
                        accessToken, 
                        refreshToken 
                    }, 
                    "Access token refreshed successfully"
                )
            );
            
    } catch (error) {
        // Handle JWT verification errors (expired, invalid, tampered tokens)
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Refresh token expired - Please login again");
        } else if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid refresh token - Please login again");
        } else {
            // Handle other errors (database errors, etc.)
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }
});


const changeCurrentPassword=asynchandler(async (req,res)=>
{
 const {oldPassword,newPassword}=req.body;
 const user=await User.findById(req.user?._id);
 const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
 if(!isPasswordCorrect)
 {
   throw new ApiError(400,"Invalid old Password");
 }
 user.password=newPassword;
 await  user.save({validateBeforeSave:false});
 return res
 .status(200)
 .json(new apiResponse(200,{},"passward changed successfully"))
});

const getcurrentUser=asynchandler(async(req,res)=>
{
   return res
   .status(200)
   .json( new apiResponse(200,req.user,"current User fetched successfully"))
});

const updateAccountDetails=asynchandler(async (req,res)=>
{
   const {fullname,email}=req.body;
   if(!fullname || !email)
   {
      throw new ApiError(400,"All fields are required");
   }
  const user= await User.findByIdAndUpdate(req.user?._id,{
   $set:{ 
      fullname:fullname, 
      email:email
   }
  },{new:true}).select("-password");//{new:true} means return updated user

  return res
  .status(200)
  .json(new apiResponse(200,user,"Account Successfully Updated"));
})

const updateUserAvatar=asynchandler(async (req,res)=>
{
    const avatarLocalPath= req.file?.path;
    if(!avatarLocalPath)
    {
      throw new ApiError(400,"Avatar file is missing")
    }
  const avatar= await uploadFromLocal(avatarLocalPath);
  if(!avatar.url)
  {
    throw new ApiError(400,"Error While uploading avatar")
  }
  const user= await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      avatar:avatar.url
   }
  },{new:true}).select("-password");

  return res
  .status(200)
  .json(new apiResponse(200,user,"Avatar upadated Successfully"))
})
const updateUserCoverImage=asynchandler(async (req,res)=>
{
    const coverImageLocalPath= req.file?.path;
    if(!coverImageLocalPath)
    {
      throw new ApiError(400,"cover image file is missing")
    }
  const coverImage= await uploadFromLocal(coverImageLocalPath);
  if(!coverImage.url)
  {
    throw new ApiError(400,"Error While uploading avatar")
  }
  const user= await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      coverImage:coverImage.url
   }
  },{new:true}).select("-password");

  return res 
  .status(200)
  .json(new apiResponse(200,user,"cover Image upadated Successfully"))
});
 
//when user search for channel what he will see
// 1.username
// 2.fullname
// 3.avatar
// 4.subscribers count
// 5.(he or this channel)subscribedto count 
// 6.is user(i-sandesh) subscribed to this channel
 //7.coverImage
 //8.avatar
//in short creating api for channel profile
//study about aggresstion 
const getUserChannelProfile = asynchandler(async (req, res) => {
   const { username } = req.params;
   if (!username?.trim()) {
     throw new ApiError(400, "Username is required"); // changed 404 -> 400 for invalid input
   }
 
   //! User.find({username});//insterd of find user and implement aggregration use below statement
   // aggregate() is a method that allows you to perform advanced data processing on collections.
   // Instead of just finding documents (find()), you can transform, filter, group, sort, or reshape data.
   // It takes an array of pipeline stages ([{}, {}, {}]) where each object {} is a stage.
 
   // it is just like writing query in sql
 
   //problem statement:i need all subscriber of channel
   const channel = await User.aggregate([
     {
       $match: {
         username: username?.toLowerCase(),
       },
     },
     {
       $lookup: {
         from: "subscriptions", //in database collection name is stored in lowercase with pural form
         localField: "_id",
         foreignField: "channel",
         as: "subscribers", // ✅ fixed missing colon
       },
     },
     {
       $lookup: {
         from: "subscriptions", //in database collection name is stored in lowercase with pural form
         localField: "_id",
         foreignField: "subscriber", // ✅ should be "subscriber" not "channel" (for subscribedTo)
         as: "subscribedTo", // ✅ fixed invalid identifier (needed quotes)
       },
     },
     {
       $addFields: {
         subscriberscount: {
           $size: "$subscribers", //count of subcribers
         },
         channelssubscribedTocount: {
           $size: "$subscribedTo", // ✅ fixed typo "subscribedTO"
         },
         issubscriber: {
           $cond: {
             if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //means you or logged in user is subscribed to the username channel
             then: true,
             else: false,
           },
         },
       },
     },
     {
       $project: {
         fullname: 1,
         username: 1,
         subscriberscount: 1,
         channelssubscribedTocount: 1,
         issubscriber: 1,
         avatar: 1,
         coverImage: 1,
       },
     },
   ]); //subscriberscount and channelssubscribedTocount fields are added to user document
 
   if (!channel?.length) { // ✅ fixed "lenght" -> "length"
     throw new ApiError(404, "Channel not found"); 
   }
 
   return res
     .status(200)
     .json(new apiResponse(200, channel[0], "User channel fetched successfully"));
 });
 
const getWatchHistory=asynchandler(async (req,res)=>
{
// When querying/aggregating, wrap req.user._id in mongoose.Types.ObjectId().
// If you’re saving it in another document as a reference, store it as ObjectId type, not string. 
// reason
// Because req.user._id is a string but MongoDB stores _id as an ObjectId, and MongoDB does strict type checking.
const user = User.aggregate([
   {
     $match: {
       // _id:req.user._id wrong
       _id: new mongoose.Types.ObjectId(req.user._id)
     }
   },
   {
     // performing join between user and video to join watchHistory 
     // and for owner in video as it is user we perform another join with user to store user in video's owner
 
     // watchHistory(_id) -> (join) -> video(_id) 
     // videos(owner) -> (join) -> user(_id) 
     $lookup: {
       from: "videos",
       localField: "watchHistory",
       foreignField: "_id",
       as: "watchHistory",
       pipeline: [
         {
           $lookup: {
             from: "users",
             localField: "owner",
             foreignField: "_id",
             as: "owner",
             pipeline: [
               {
                 // to store only the required properties in owner we use pipeline and use $project inside the owner itself
                 $project: {
                   fullname: 1,
                   username: 1,
                   avatar: 1
                 }
               }
             ]
           }
         },
         {
           $addFields: {
             // check below why I used this
             owner: { $first: "$owner" }
           }
         }
       ]
     }
   }
 ]);
 

return res
.status(200)
.json(new apiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
});

export {
   register,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getcurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
 };
 


// Good question 👌
// If you **don’t write the `$addFields` stage**, here’s what happens:
// * After `$lookup`, the `owner` field will be an **array**, even if there’s only **one matched user**.
//   Example:
//   ```js
//   {
//     title: "Post 1",
//     owner: [
//       {
//         fullname: "Sandesh",
//         username: "sandesh123",
//         avatar: "pic.jpg"
//       }
//     ]
//   }
//   ```
// * With `$addFields` + `$first`, you "unwrap" the array so `owner` becomes a **single object** instead of an array:
//   ```js
//   {
//     title: "Post 1",
//     owner: {
//       fullname: "Sandesh",
//       username: "sandesh123",
//       avatar: "pic.jpg"
//     }
//   }
//   ```
// --
// 👉 So without `$addFields`, you’ll always get `owner` as an **array of objects**, not a plain object.
// Do you want me to also explain **when it’s better to keep it an array** instead of `$first`?
