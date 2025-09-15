import { Router } from "express";
import { 
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
} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import {verifyJWT} from "../middleware/auth.middleware.js"
//! Because in most tutorials boilerplates:
// Each router file has exactly one main export (the router itself).
// That’s why they use export default router;, so you can import it with any name you like
const router=Router();
//use .field if u have multiple field files 
router.route("/register").post( 
    upload.fields([
        {
          name:"avatar",
          maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    register
)
// router.get("/test", (req, res) => {
//     res.send("User routes working!");
//   });
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
 
router.route("/refresh-token").post(refreshAccessToken  );
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").post(verifyJWT,getcurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);//first user must be login then multer should be used to allow files then controller
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);//first user must be login then multer should be used to allow files then controller
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);


  
export default router;