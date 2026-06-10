import nodemailer from "nodemailer";

/**
 * Sends a password reset email to the user.
 * Falls back to logging the reset link in the console/terminal in local development
 * if SMTP configurations are not fully set in the environment.
 * 
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<boolean>} - True if sent/logged successfully
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  const isSmtpConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // True for port 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const mailOptions = {
        from: SMTP_FROM || `"Multi-User Blog Platform" <no-reply@engineeringblog.com>`,
        to: email,
        subject: "Password Reset Request",
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
            <h2 style="color: #0F172A; text-align: center;">Password Reset Request</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">Please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748B; font-size: 14px; line-height: 1.5;">This link will expire in 1 hour.</p>
            <p style="color: #64748B; font-size: 14px; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94A3B8; font-size: 12px; text-align: center;">Multi-User Blog Platform Inc.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Password reset email successfully sent to ${email}`);
      return true;
    } catch (error) {
      console.error("[SMTP Error] Failed to send password reset email via SMTP:", error);
      // Fall through to console logging fallback so the app continues to work
    }
  }

  // Fallback console log output (visually framed)
  console.log("\n" + "=".repeat(80));
  console.log(" PASSWORD RESET MAIL SERVICE (FALLBACK)");
  console.log("-".repeat(80));
  console.log(`To:      ${email}`);
  console.log(`Subject: Password Reset Request`);
  console.log(`Link:    ${resetUrl}`);
  console.log("-".repeat(80));
  console.log("Copy and paste the link above into your browser/frontend to proceed.");
  console.log("=".repeat(80) + "\n");

  return true;
};
