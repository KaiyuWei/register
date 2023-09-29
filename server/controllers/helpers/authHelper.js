/**
 * helper functions in the authentication process
 */

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
    Source: config.EMAIL_FROM,
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
                            <h1>Welcome to Realist</h1>
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
