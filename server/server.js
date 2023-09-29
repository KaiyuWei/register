/**
 * This is the entry of the server when it starts.
 */
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import mysql from "mysql";

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

// database connection configuration
const config = {
  host: process.env.RDS_HOSTNAME,
  port: process.env.PORT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
};

// the db instance
// const db = mysql.getInstance(config);

const connection = mysql.createConnection(config);

connection.connect(function (err) {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }

  console.log("DATABASE CONNECTED");
});

// listen to http requests
app.listen(8000, () => console.log("Hello world"));
