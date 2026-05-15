import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use a "Google App Password," not your real password
  }
});

async function sendDailyRevision(userEmail, content) {
  const mailOptions = {
    from: '"Revision App" <your-email@gmail.com>',
    to: userEmail,
    subject: `Daily Revision: ${content.topic}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>${content.topic}</h1>
        <p><b>Interview Relevance:</b> ${content.interviewRelevance}</p>
        <hr />
        <div>${content.lessonBody}</div>
        <hr />
        <h3>Quick Quiz</h3>
        <p>${content.quiz.question}</p>
        <details>
          <button>Click to see answer</button>
          <p>${content.quiz.answer}</p>
        </details>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}

export default sendDailyRevision;