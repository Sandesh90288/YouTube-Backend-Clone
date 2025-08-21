import express, { urlencoded } from "express";
import cros from "cros";
import cookieParser from "cookie-parser";
const app=express();

app.use(cros({
    origin:process.env.CROS_ORIGIN,
    credentials:true
}))//* allow only limited number of ports to interact with this server like frontend etc
app.use(express.json({limit:"16kb"}));//you’re telling Express to parse incoming JSON requests, but with a maximum allowed size of 16 kilobytes.
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

export {app};