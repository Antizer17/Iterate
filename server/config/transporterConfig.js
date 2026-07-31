import nodemailer from "nodemailer";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verify Failed:", error);
  } else {
    console.log("✅ SMTP Server is ready");
  }
});
export default transporter;