/**
 * the controllers for authentication process
 */
import validator from "email-validator";
import * as authHelper from "./helpers/authHelper.js";
import pool from "../DB/db.js";
import SES from "aws-sdk/clients/ses.js";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

/**
 * user pre-register
 */
export const preRegister = async (req, res) => {
  // the email and password from the request body
  const { first_name, last_name, email, password } = req.body;

  // validate the email and the password format
  if (!validator.validate(email)) {
    return res.json({ error: "A valid email is required" });
  }

  // validate the password format. if validation fails, we stop here.
  if (!(authHelper.passwordFormat(password, res) === true)) return;

  // check if the email is already registered
  await new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  })
    .catch((error) => {
      res.json({ error: error.message });
      return;
    })
    .then((results) => {
      // the email is  registered
      if (results.length !== 0) {
        return res.json({ error: "duplicate email address" });
      }

      // the email is not registered
      // the token for user identification in email activation
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
            return res.json({ error: err.message });
          } else {
            console.log(data);
            return res.json({ ok: true });
          }
        }
      );
    });
};

/**
 * user register
 */
export const register = async (req, res) => {
  // decode the user data
  const { first_name, last_name, email, password } = jwt.verify(
    req.body.token,
    process.env.JWT_SECRET
  );

  // hash the password
  const hashedPassword = await authHelper.hashPassword(password);

  // we need to assign the user an id for identifying
  const user_id = nanoid(8);

  // store the user data in the database
  await new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO users (first_name, last_name, email, password, user_id) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, user_id],
      (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      }
    );
  })
    .then(() => res.json({ ok: true }))
    .catch((e) => res.json({ error: e.message }));
};

/**
 * user login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    pool.query(
      "SELECT password FROM users WHERE email = ?",
      [email],
      function (error, results, fields) {
        if (error) console.log(error);

        // we find a duplicate email
        if (results[0] !== undefined) {
          return res.json({ error: "duplicate email" });
        }

        // this email is not used, call the controller.
        next();
      }
    );

    // if no existing users with the given email address
    if (results.length === 0)
      throw new Error(`cannot find a user with email ${email}`);

    // compare the password
    const match = await bcrypt.compare(password, results[0].password);
    if (!match) {
      return res.json({ error: "wrong password" });
    }
    // return the login token
    return tokenAndUserResponse(req, res, user);
  } catch (err) {
    console.log(err);
    return res.json({ error: err.toString() });
  }
};

/**
 * user password reset
 */
