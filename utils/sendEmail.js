const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  // create reusable transporter object using default SMTP transport
  const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
             user: process.env.EMAIL_USER,
             pass: process.env.EMAIL_PASS
      },
      tls:{
          rejectUnauthorized: false
      },
  });

  
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text
  }

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
}


module.exports = sendEmail;
