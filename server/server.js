/**
 * This is the entry of the server when it starts.
 */
import "dotenv/config";
console.log(process.env);
import express from "express";
import morgan from "morgan";
import cors from "cors";

// create the app
const app = express();

// middleware for parsing the json payload
app.use(express.json());
// log HTTP requests info in "dev" mode
app.use(morgan("dev"));
// avoid cors error
app.use(cors());

app.get("/api", (req, res) => {
  res.json({
    data: "hello world",
  });
});

const mysql = require("mysql");

// listen to http requests
app.listen(8000, () => console.log("Hello world"));
