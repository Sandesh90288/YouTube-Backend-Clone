import { Router } from "express";
import { register } from "../controllers/user.controller.js";
//! Because in most tutorials boilerplates:
// Each router file has exactly one main export (the router itself).
// That’s why they use export default router;, so you can import it with any name you like
const router=Router();

router.route("/register").get(register)
export default router;