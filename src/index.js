import dotenv from "dotenv";
dotenv.config({
    path:'./.env' 
});

import mongoose from "mongoose";
import express from "express";
import { database_name } from "../src/constraints.js";

const app = express(); 

// lets work with better approach for db connection is using 
// Async IIFE (Immediately Invoked Function Expression) using an arrow function.
(async () => { 
  try {
    let url = `${process.env.MONGO_URI}/${database_name}`;
    const connectioninstance=await mongoose.connect(url);
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });
    console.log(`\n MONGODB connected  || DB host :${connectioninstance.connection.host}`)
    app.listen(process.env.PORT, () => {
      console.log(`http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("mongodb connection failed", error);
    throw error;
  }
})();
