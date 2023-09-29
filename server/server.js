/**
 * This is the entry of the server when it starts.
 */
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import mysql from "mysql";
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

// database connection configuration
const config = {
  host: process.env.RDS_HOSTNAME,
  port: process.env.PORT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
};

// the db connection instance
const connection = mysql.createConnection(config);

// connect to MYSQL server on AWS
connection.connect(function (err) {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("DATABASE CONNECTED");
});

// listen to http requests
app.listen(8000, () => console.log("SERVER READY ON PORT 8000"));
