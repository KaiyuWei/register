/**
 * helper functions in the authentication process
 */
import bcrypt from "bcrypt";
import pool from "../DB/db.js";

/**
 * validate the password format. This should be done in the frontend. We add it here
 * just in case.
 */
export const passwordFormat = (password, res) => {
  // the password is required
  if (!password) {
    return res.json({
      errorCode: 1,
      error: "password is required",
    });
  }

  // the password should be longer than 6 characters
  if (password.length < 6) {
    return res.json({
      errorCode: 2,
      error: "password should be at least 6 characters",
    });
  }

  // the password should contain lower-case characters
  if (!/[a-z]/.test(password)) {
    return res.json({
      errorCode: 3,
      error: "password should contain at least one lower-case character",
    });
  }

  // the password should contain upper-case characters
  if (!/[A-Z]/.test(password)) {
    return res.json({
      errorCode: 3,
      error: "password should contain at least one upper-case character",
    });
  }

  // the password should contain numeric characters
  if (!/[0-9]/.test(password)) {
    return res.json({
      errorCode: 3,
      error: "password should contain at least one number",
    });
  }

  // all check passed
  return true;
};

/**
 * a function that returns options for AWSSES sendEmail method
 */
export const emailTemplate = (email, content, replyTo, subject) => {
  // the style used for the email template
  const style = `
    background: #eee;
    padding: 30px;
    border-radius 20px;
`;
  return {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [replyTo],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
                        <html>
                            <div style="${style}">
                            <h1>Welcome to Brink</h1>
                            ${content}
                            <p>&copy; ${new Date().getFullYear()}</p>
                            </div>
                        </html>
                    `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  };
};

/**
 * the function that returns a hashed password
 * @param string the password to be hashed
 * @return string tha hashed password
 */
export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      // handle the error
      if (err) {
        reject(err);
      }

      // if no error, hash the password with the generated salt
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

/**
 * make queries using the pool connection.
 * @param string the query string
 * @param array the parameters to be added in the query string
 */
export const query = (query, parameters) => {
  // check if the email has been registerd
  pool.getConnection(function (err, connection) {
    // in case the connection fails
    if (err) return res.json({ error: "DB connection failed" });

    connection.query(query, parameters, function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();

      // Handle error after the release.
      if (error) return res.json({ error: "query failed" });

      // return the query results
      return results;
    });
  });
};

/**
 * a helper function for updating the login token and the refresh token
 */
const tokenAndUserResponse = (req, res, user) => {
  // create jwt tokens
  // token for login
  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "1h",
  });

  // token for generating new login token
  const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  // sent response
  // do not send the password in the response, so we set them to 'undefined'
  // just in the response (the real password is saved in the database already)
  user.password = undefined;
  user.resetCode = undefined;

  // return the data in json format
  return res.json({
    token,
    refreshToken,
    user,
  });
};
