/**
 * for routing in the authentication process
 */
import express from "express";
import * as auth from "../controllers/auth.js";

// the router instance from express
const router = express.Router();

// pre-register will send the user an email including an activation link
router.post("/pre-register", auth.preRegister);
// register the user and store the user data in the database
router.post("/register", auth.register);
// user login
router.post("/login", auth.login);
// for resetting user password in case user forgets the it
router.post("/forgot-password", auth.forgotPassword);
// for resetting user's password
router.post("/reset-password", auth.resetPassword);

export default router;
