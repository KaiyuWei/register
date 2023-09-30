/**
 * middlewares in authentication process
 */
import pool from "../DB/db.js";

/**
 * check if there is duplicate emails
 */
export const duplicateEmail = (req, res, next) => {
  try {
    const { email } = req.body;
    // check if the email has been registerd
    pool.query(
      "select * from users where email = ?",
      [email],
      function (error, results, fields) {
        if (error) throw error;

        // we find a duplicate email
        if (results[0] !== undefined) {
          return res.json({ error: "duplicate email" });
        }

        // this email is not used, call the controller.
        next();
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
};
