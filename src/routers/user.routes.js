import { Router } from "express";
import { register,loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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
router.get("/test", (req, res) => {
    res.send("User routes working!");
  });
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
 
router.route("/refresh-token").post(refreshAccessToken)
  
export default router;