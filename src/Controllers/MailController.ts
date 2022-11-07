import express from "express";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

const MailRouter = express.Router();

MailRouter.post("/send-email", async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailData = {
    from: req.body.email,
    to: process.env.EMAIL_ADDRESS_RECIPIENT,
    subject: req.body.subject,
    text: req.body.message,
    html: `<h1>${req.body.message}</h1>`,
  };

  const body = JSON.stringify({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: req.body.token,
  });

  try {
    const resy = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.token}`,
      }
    );

    const response = await resy.json();

    //@ts-ignore
    if (!response.success) {
      return res.status(400).send("You are a robot.");
    }
  } catch (error) {
    return res.status(400).send("ReCAPTCHA failed.");
  }

  transporter.sendMail(mailData, (err: any, info: any) => {
    if (err) {
      return res.status(400).send("Failed to send email.");
    } else {
      return res.status(200).end();
    }
  });
});

export default MailRouter;
