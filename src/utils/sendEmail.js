import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if SMTP environment variables are configured
    if (
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    ) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for others
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Secure Auth" <noreply@example.com>',
        to,
        subject,
        text,
        html,
      });

      console.log(`[SMTP Mail] Email sent: ${info.messageId}`);
      return info;
    } else {
      // Fallback for development/testing when SMTP variables are not set
      console.log("\n=================== MOCK EMAIL START ===================");
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text:\n${text}`);
      console.log("=================== MOCK EMAIL END ===================\n");
      return { mock: true, to, subject };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    // Do not block the flow in development mode even if SMTP fails
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Email could not be sent: ${error.message}`);
    }
  }
};
