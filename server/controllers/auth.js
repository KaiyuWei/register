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
import bcrypt from "bcrypt";

/**
 * A helper function that generate a new session for a user
 * @param Object req request
 * @param Object res response
 * @param string the user's id
 */
const regenerateSession = async (req, res, userID) => {
  // regenerate the session
  req.session.regenerate(function (err) {
    if (err) return res.json({ error: err.message });

    // store the user info in the session
    req.session.user = userID;

    // save the new session
    req.session.save(async function (err) {
      if (err) return next(err);

      // update the user login time
      await new Promise((resolve, reject) => {
        pool.query(
          "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
          [userID],
          function (error, results, fields) {
            if (error) reject(error);
            resolve(results);
          }
        );
      })
        .catch((err) => res.json({ error: err.message }))
        .then(() => {
          // send back cookies with the new session id
          res
            .cookie("connect.sid", req.session.id)
            .cookie("user_id", userID)
            .send({ auth: true });
        });
    });
  });
};
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

  // check if the email is already registered
  new Promise((resolve, reject) => {
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
        <a href="${process.env.CLIENT_URL}/account-activate/${token}">Activate account</a>`;

      // send the email
      ses.sendEmail(
        // the helper function returns the first argument of the ::sendEmail() method
        authHelper.emailTemplate(
          email,
          content,
          process.env.REPLY_TO,
          "Activate your account",
          "Welcome to Brink"
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
  try {
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
    new Promise((resolve, reject) => {
      pool.query(
        "INSERT INTO users (first_name, last_name, email, password, user_id) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, email, hashedPassword, user_id],
        (error, results) => {
          if (error) return reject(error);
          return resolve(results);
        }
      );
    })
      .then(async () => {
        // update the user login time
        await new Promise((resolve, reject) => {
          pool.query(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
            [user_id],
            function (error, results, fields) {
              if (error) reject(error);
              resolve(results);
            }
          );
        })
          .catch((err) => res.json({ error: err.message }))
          .then(() => {
            req.session.user = user_id;
            // send back cookies
            res.cookie("user_id", user_id).json({ auth: true });
          });
      })
      .catch((e) => res.json({ error: e.message }));
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
};

/**
 * user login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // search for the email address in the database
  await new Promise((resolve, reject) => {
    pool.query(
      "SELECT user_id, password FROM users WHERE email = ?",
      [email],
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  })
    .catch((e) => {
      return res.json({ error: e.message });
    })
    .then(async (results) => {
      // if no existing users with the given email address
      if (results.length === 0)
        return res.json({ error: `cannot find a user with email ${email}` });

      // compare the password
      const match = await bcrypt.compare(password, results[0].password);
      if (!match) {
        return res.json({ error: "wrong password" });
      }

      // the userid
      const userID = results[0].user_id;

      // regenerate the login session
      regenerateSession(req, res, userID);
    });
};

/**
 * In case that a user forget password, this method sends an email to the user for
 * resetting the password
 */
export const forgotPassword = async (req, res) => {
  // the email for resetting the password
  const { email } = req.body;

  // search the email in the database
  new Promise((resolve, reject) => {
    pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      }
    );
  })
    .catch((error) => {
      res.json({ error: error.message });
    })
    .then((results) => {
      // the email is not registered
      if (results.length === 0)
        return res.json({ error: "the email is not registered" });

      // the email is registered. Get the user id
      const userID = results[0].user_id;

      // generate a token containin the user_id
      const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
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
        <p>Click the link below to reset your password</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset password</a>`;

      // send the email
      ses.sendEmail(
        // the helper function returns the first argument of the ::sendEmail() method
        authHelper.emailTemplate(
          email,
          content,
          process.env.REPLY_TO,
          "Reset your password",
          "Reset your password"
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
 * reset the user password
 */
export const resetPassword = (req, res) => {
  // the token includes user id
  const { userID } = jwt.verify(req.body.token, process.env.JWT_SECRET);

  // search for the user id in the database
  new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [userID],
      (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      }
    );
  })
    .catch((error) => {
      res.json({ error: error.message });
    })
    .then(async (results) => {
      // if the user is not in the database
      if (results.length === 0) res.json({ error: "no user found" });

      // hash the new password
      const hashedPassword = await authHelper.hashPassword(req.body.password);

      // update the new password in the database
      new Promise((resolve, reject) => {
        pool.query(
          "UPDATE users SET password = ? WHERE user_id = ?",
          [hashedPassword, results[0].user_id],
          (error, results) => {
            if (error) return reject(error);
            return resolve(results);
          }
        );
      })
        .catch((error) => res.json({ error: error.message }))
        .then(() => res.json({ ok: true }));
    });
};

export const logout = (req, res) => {
  // remove a session from the databae
  new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM sessions WHERE session_id = ?",
      [req.session.id],
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  })
    .catch((error) => {
      res.json({ error: error.message });
    })
    .then(() => {
      // destroy cookie
      res.clearCookie("connect.sid");
      res.clearCookie("user_id");
      res.send({ true: "ok" });
    });
};

/**
 * check the user's authentication state
 */
export const authenticate = (req, res) => {
  // if no user id, authentication fails
  if (!req.session.user) return res.json({ auth: false });

  new Promise((resolve, reject) => {
    // search for the login session
    pool.query(
      "SELECT expires, data FROM sessions WHERE session_id = ?",
      [req.session.id],
      (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      }
    );
  })
    .catch((error) => {
      res.json({ error: error.message });
    })
    .then((results) => {
      // compare current time with the expiry time of the session
      const currentTimestamp = Math.floor(Date.now() / 1000);
      // if no such user in the database or the session is expired
      if (results.length === 0 || results[0].expires < currentTimestamp) {
        return res
          .clearCookie("user_id")
          .clearCookie("connect.sid")
          .json({ error: "session expired" });
      }

      // parse the data string to get the user id
      const data = JSON.parse(results[0].data);

      // compare the user id and return auth => true if they match
      if (req.session.user === data.user) {
        res.json({
          auth: true,
        });
      } else res.json({ auth: false });
    });
};
