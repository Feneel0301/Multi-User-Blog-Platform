import nodemailer from "nodemailer";

// Create transporter if SMTP configurations are present in env
const getTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

export const sendDeleteVerificationCode = async (email, articleTitle, code) => {
  // 1. Log verification code in a beautiful high-visibility console box
  const border = "┌" + "─".repeat(60) + "┐";
  const empty = "│" + " ".repeat(60) + "│";
  
  console.log("\n" + border);
  console.log("│" + "  DELETE VERIFICATION CODE REQUIRED  ".padStart(48).padEnd(60) + "│");
  console.log(border);
  console.log(`│  To: ${email.padEnd(52)}│`);
  console.log(`│  Article: ${articleTitle.substring(0, 48).padEnd(49)}│`);
  console.log(`│  Code: ${code.padEnd(50)}│`);
  console.log(`│  Expires in: 10 Minutes${" ".repeat(35)}│`);
  console.log(border + "\n");

  // 2. Attempt to send via Nodemailer if SMTP is configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      const mailOptions = {
        from: `"Multi-User Blog Platform" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verification Code: Delete Published Article",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px; background-color: #fafafa;">
            <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Security Verification Code</h2>
            <p style="color: #334155; font-size: 16px;">
              You requested to delete the published article: <strong style="color: #0f172a;">"${articleTitle}"</strong>.
            </p>
            <p style="color: #475569; font-size: 14px;">
              Please use the following 6-digit verification code to confirm deletion. This code is valid for 10 minutes.
            </p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 6px; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a;">${code}</span>
            </div>
            <p style="color: #ef4444; font-size: 12px; font-weight: 500;">
              Warning: Moving this article to Trash is a destructive action. If you did not request this, please ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              This is an automated email from the Multi-User Engineering Blog Platform.
            </p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      console.error("Failed to send verification email via SMTP:", error.message);
    }
  } else {
    console.log("SMTP environment variables not configured. Verification code logged above.");
  }
};
