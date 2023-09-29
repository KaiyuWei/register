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
    // first_name and last_name can be undefined.
    const token = jwt.sign(
      { first_name, last_name, email, password },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

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
export const register = async (req, res) => {
  try {
    // decode the user data
    const { first_name, last_name, email, password } = jwt.verify(
      req.body.token,
      process.env.JWT_SECRET
    );

    // hash the password
    const hashedPassword = await authHelper.hashPassword(password);

    // store the user data in the database
    pool.getConnection(function (err, connection) {
      // in case the connection fails
      if (err) return res.json({ error: "DB connection failed" });

      connection.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
        [first_name, last_name, email, hashedPassword],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) return res.json({ error: "user data insertion failed" });

          // indicate success
          res.json({ ok: true });
        }
      );
    });
  } catch (err) {
    console.log(err);
    res.json({ error: err.message });
  }
};

/**
 * user login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find the user by email
    pool.getConnection(function (err, connection) {
      // in case the connection fails
      if (err) return res.json({ error: "DB connection failed" });

      connection.query(
        "SELECT password FROM users WHERE email = ?",
        email,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) return res.json({ error: "query" });

          // indicate success
          res.json({ ok: true });
        }
      );
    });

    // if no existing users with the given email address
    if (!user) throw new Error(`cannot find a user with email ${email}`);

    // compare the password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "wrong password" });
    }

    // return the use data and updated login token
    return tokenAndUserResponse(req, res, user);
  } catch (err) {
    console.log(err);
    return res.json({ error: err.toString() });
  }
};

/**
 * user password reset
 */
