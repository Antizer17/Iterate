import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  socketTimeout: 60000, // Increase timeout limit
  // Force IPv4 family
  tls: {
    rejectUnauthorized: true
  },
  // If your nodemailer version supports connection options:
  pool: true
});

export default transporter;