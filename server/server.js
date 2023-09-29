/**
 * This is the entry of the server when it starts.
 */
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import AuthRouter from "./routes/auth.js";

// create the app
const app = express();

// middleware for parsing the json payload
app.use(express.json());
// log HTTP requests info in "dev" mode
app.use(morgan("dev"));
// avoid cors error
app.use(cors());
// use the router middleware
app.use("/api", AuthRouter);

// listen to http requests
app.listen(8000, () => console.log("SERVER READY ON PORT 8000"));
