function resetPasswordEmail(resetURL) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="
        width="550"
        margin: auto;
        padding: 0;
        background-color: #cbd7d1;
        font-family: Arial, Helvetica, sans-serif;
      ">
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #cbd7d1;
          "
        >
          <tr>
            <td align="center" style="padding: 15px 10px;">
              <img
                src="cid:task-manager-logo"
                alt="Smith's Task Manager"
                width="45"
                height="45"
                style="
                  display: block;
                  width: 45px;
                  height: 45px;
                  border: 0;
                  margin: 0 auto;
                "
              />

              <h3 style="
                color: #606868;
                font-size: 18px;
                font-weight: 700;
                letter-spacing: 0.5px;
                margin: 5px 0 15px 0;
              ">
                Smith's Task Manager
              </h3>

              <table
                role="presentation"
                width="550"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 550px;
                  background-color: #606868;
                  border-radius: 5px;
                  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
                "
              >
                <tr>
                  <td style="
                    padding: 35px 30px;
                  ">
                    <h2 style="
                      color: #cbd7d1;
                      font-size: 24px;
                      font-weight: 700;
                      letter-spacing: 0.5px;
                      text-align: center;
                      margin: 0 0 18px 0;
                    ">
                      Reset your password
                    </h2>

                    <table
                      role="presentation"
                      width="80%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      align="center"
                      style="
                        width: 80%;
                        margin: 0 auto 20px auto;
                      "
                    >
                      <tr>
                        <td
                          height="1"
                          style="
                            height: 1px;
                            line-height: 1px;
                            font-size: 1px;
                            background-color: #95a1a1;
                          "
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>

                    <p style="
                      margin: 0 0 15px 0;
                      color: #cbd7d1;
                      font-size: 13px;
                      line-height: 20px;
                      letter-spacing: 0.5px;
                    ">
                      Hi there,
                    </p>

                    <p style="
                      margin: 0 0 15px 0;
                      color: #cbd7d1;
                      font-size: 13px;
                      line-height: 20px;
                      letter-spacing: 0.5px;
                    ">
                      We received a request to reset your password for
                      Smith's Task Manager account.
                    </p>

                    <p style="
                      margin: 0;
                      color: #cbd7d1;
                      font-size: 13px;
                      line-height: 20px;
                      letter-spacing: 0.5px;
                    ">
                      Click the button below to choose a new password.
                    </p>

                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      align="center"
                      style="
                        margin: 25px auto 10px auto;
                      "
                    >
                      <tr>
                        <td
                          align="center"
                          bgcolor="#cbd7d1"
                          style="
                            background-color: #cbd7d1;
                            border-radius: 14px;
                          "
                        >
                          <a
                            href="${resetURL}"
                            target="_blank"
                            style="
                              display: inline-block;
                              color: #606868;
                              font-size: 14px;
                              font-weight: 700;
                              letter-spacing: 0.5px;
                              text-decoration: none;
                              padding: 8px 16px;
                              border-radius: 20px;
                            "
                          >
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      align="center"
                      style="
                        margin: 0 auto 15px auto;
                      "
                    >
                      <tr>
                        <td
                          valign="middle"
                          style="
                            color: #cbd7d1;
                            font-size: 18px;
                            line-height: 20px;
                            padding-right: 5px;
                          "
                        >
                          ⏱
                        </td>

                        <td
                          valign="middle"
                          style="
                            color: #cbd7d1;
                            font-size: 13px;
                            line-height: 20px;
                            letter-spacing: 0.5px;
                          "
                        >
                          This link will expire in 10 minutes.
                        </td>
                      </tr>
                    </table>

                    <table
                      role="presentation"
                      width="80%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      align="center"
                      style="
                        width: 80%;
                        margin: 0 auto 20px auto;
                      "
                    >
                      <tr>
                        <td
                          height="1"
                          style="
                            height: 1px;
                            line-height: 1px;
                            font-size: 1px;
                            background-color: #95a1a1;
                          "
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>

                    <p style="
                      margin: 0 0 18px 0;
                      color: #cbd7d1;
                      font-size: 13px;
                      line-height: 20px;
                      letter-spacing: 0.5px;
                    ">
                      If you didn't request a password reset, you can safely
                      ignore this email.
                    </p>

                    <p style="
                      margin: 0;
                      color: #cbd7d1;
                      font-size: 13px;
                      line-height: 20px;
                      letter-spacing: 0.5px;
                    ">
                      Thanks,<br />
                      Smith's Task Manager
                    </p>

                  </td>
                </tr>
              </table>

              <p style="
                margin: 15px 0 4px 0;
                color: #606868;
                font-size: 13px;
                font-weight: 700;
                line-height: 18px;
                letter-spacing: 0.5px;
                text-align: center;
              ">
                &copy; 2026 Smith's Task Manager. All rights reserved.
              </p>

              <p style="
                margin: 0;
                color: #606868;
                font-size: 13px;
                line-height: 18px;
                letter-spacing: 0.5px;
                text-align: center;
              ">
                This is an automated email. Please do not reply.
              </p>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

module.exports = resetPasswordEmail;