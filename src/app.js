import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();

app.use(cors({
    origin:process.env.CROS_ORIGIN,
    credentials:true
}))//* allow only limited number of ports to interact with this server like frontend etc
app.use(express.json({limit:"16kb"}));//you’re telling Express to parse incoming JSON requests, but with a maximum allowed size of 16 kilobytes.
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
//routers
import userroutes from "./routers/user.routes.js"
app.use("/api/v1/users",userroutes);


export {app};