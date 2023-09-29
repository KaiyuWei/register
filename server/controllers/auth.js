/**
 * the controllers for authentication process
 */
import mysql from "mysql";
import validator from "email-validator";
import * as authHelper from "./helpers/authHelper.js";

/**
 * user pre-register
 */
export const preRegister = async (req, res) => {
  try {
    // the email and password from the request body
    const { email, password } = req.body;

    // validate the email and the password format
    if (!validator.validate(email)) {
      return res.json({ error: "A valid email is required" });
    }

    // validate the password format. if validation fails, we stop here.
    if (!(authHelper.passwordFormat(password) === true)) return;

    // check if the email has been registerd
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ error: "Email is taken" });
    }

    // the token for user identification
    const token = jwt.sign({ email, password }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    // the email body content
    const content = `
    <p>Click the link below to activate your account</p>
    <a href="${config.CLIENT_URL}/auth/account-activate/${token}">Activate account</a>`;

    // send the email
    config.AWSSES.sendEmail(
      // the helper function returns the first argument of the ::sendEmail() method
      emailTemplate(email, content, config.REPLY_TO, "Activate your account"),

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
    return res.json({ error: "something went wrong" });
  }
};

/**
 * user register
 */

/**
 * user password reset
 */

/**
 * user login
 */
