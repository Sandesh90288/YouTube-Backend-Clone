import { asynchandler } from "../utils/asyncHandler";
const register=asynchandler(async (req,res)=>
{
    res.status(200).json({
        message:"ok"
    })
});



export {register};