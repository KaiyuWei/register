/**
 * for routing in the authentication process
 */
import express from "express";
import { preRegister } from "../controllers/auth.js";

// the router instance from express
const router = express.Router();

// http requests routings
router.get("/", (req, res) => {
  res.json({
    data: "hello world",
  });
});

router.post("/pre-register", preRegister);

export default router;
