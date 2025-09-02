import { asynchandler } from "../utils/asyncHandler.js";
import  {ApiError} from '../utils/apiError.js';
import {User} from "../model/user.model.js"
import {uploadFromLocal} from "../utils/cloudinary.js"
import  {apiResponse} from "../utils/apiResponse.js"

const generateRefreshAndAccesstokens=async(userId)=>
{
   try {
      const user=await User.findById(userId);
     const accessToken=user.generateAccessToken();
     const refreshToken=user.generateRefreshToken();
     user.refreshtoken=refreshToken;
    await user.save(validateBeforeSave:false);
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
    if(!email||!username)
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
  const loggineduser=  await User.findById(user_id).select("-password -refreshtoken");
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
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
   .apiResponse(200,{},"User logged out successfully");
});
export {register,loginUser,logoutUser};