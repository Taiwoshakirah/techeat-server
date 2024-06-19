const nodemailer = require('nodemailer')



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Subscription Confirmation',
    text: 'Thank you for subscribing!'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Subscription successful, but failed to send confirmation email.' });
    }
    res.status(200).json({ message: 'Subscription successful and confirmation email sent.' });
  });
