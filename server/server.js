/**
 * This is the entry of the server when it starts.
 */
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import mySqlSession from "express-mysql-session";
import AuthRouter from "./routes/auth.js";
import pool from "./DB/db.js";

// create the app
const app = express();

// middleware for parsing the json payload
app.use(express.json());
// log HTTP requests info in "dev" mode
app.use(morgan("dev"));
// avoid cors error
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

// for login session storage
const MySqlStore = mySqlSession(session);
const sessionStoreConfig = {
  expiration: 86400000,
};
const sessionStore = new MySqlStore(sessionStoreConfig, pool);

// login session config
const sessionConfig = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore, // storage of login sessions
};

// the login session
app.use(session(sessionConfig));
// use the router middleware
app.use("/api", AuthRouter);

// listen to http requests
app.listen(8000, () => console.log("SERVER READY ON PORT 8000"));
