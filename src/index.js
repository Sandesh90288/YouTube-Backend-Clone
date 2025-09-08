import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import mongoose from "mongoose";
import { app } from "./app.js";   // ✅ import the configured app with routes
import { database_name } from "./constraints.js";

// Async IIFE for DB connection
(async () => { 
  try {
    let url = `${process.env.MONGO_URI}/${database_name}`;
    const connectionInstance = await mongoose.connect(url);

    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
      console.log(`✅ MongoDB connected || DB host : ${connectionInstance.connection.host}`);
    }); 

  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    throw error;
  }
})();
