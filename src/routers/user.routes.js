import { Router } from "express";
import { register } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
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
  
export default router;