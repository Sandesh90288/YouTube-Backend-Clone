import { asynchandler } from "../utils/asyncHandler.js";
import  {ApiError} from '../utils/apiError.js';
import {User} from "../model/user.model.js"
import {uploadFromLocal} from "../utils/cloudinary.js"
import  {apiResponse} from "../utils/apiResponse.js"


const register = asynchandler(async (req,res) => {
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
     const coverImageLocalPath=req.files?.coverImage[0]?.path;
     if (avatarLocalPath) {
        throw new ApiError(400,"Avatar File is required")
     }
     const avatar=await uploadFromLocal(avatarLocalPath);
     const coverImage=await uploadFromLocal(coverImageLocalPath);
 
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

export {register};