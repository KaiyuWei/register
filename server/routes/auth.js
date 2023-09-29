/**
 * for routing in the authentication process
 */
import express from "express";

// the router instance from express
const router = express.Router();

// http requests routings
router.get("/", (req, res) => {
  res.json({
    data: "hello world",
  });
});

export default router;
