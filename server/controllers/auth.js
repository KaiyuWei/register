/**
 * the controllers for authentication process
 */
import validator from "email-validator";
import * as authHelper from "./helpers/authHelper.js";
import pool from "../DB/db.js";
import SES from "aws-sdk/clients/ses.js";
import "dotenv/config.js";
import jwt from "jsonwebtoken";

/**
 * user pre-register
 */
export const preRegister = async (req, res) => {
  try {
    // the email and password from the request body
    const { first_name, last_name, email, password } = req.body;

    // validate the email and the password format
    if (!validator.validate(email)) {
      return res.json({ error: "A valid email is required" });
    }

    // validate the password format. if validation fails, we stop here.
    if (!(authHelper.passwordFormat(password, res) === true)) return;

    // check if the email has been registerd
    pool.getConnection(function (err, connection) {
      // in case the connection fails
      if (err) return res.json({ error: "DB connection failed" });

      connection.query(
        "select * from users where email = ?",
        [email],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) return res.json({ error: "query failed" });

          // we find a duplicate email
          if (results[0] !== undefined) {
            return res.json({ error: "duplicate email" });
          }
        }
      );
    });

    // the token for user identification in email activation
    const token = jwt.sign({ email, password }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // prepare the AWS SES service
    const sesConfig = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
      apiVersion: "2010-12-01",
    };

    const ses = new SES(sesConfig);

    // the email body content
    const content = `
        <p>Click the link below to activate your account</p>
        <a href="${process.env.CLIENT_URL}/auth/account-activate/${token}">Activate account</a>`;

    // send the email
    ses.sendEmail(
      // the helper function returns the first argument of the ::sendEmail() method
      authHelper.emailTemplate(
        email,
        content,
        process.env.REPLY_TO,
        "Activate your account"
      ),

      // error handler
      (err, data) => {
        if (err) {
          console.log(err);
          return res.json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.json({ error: err.message });
  }
};

/**
 * user register
 */
export const register = async (req, res) => {};

/**
 * user password reset
 */

/**
 * user login
 */
