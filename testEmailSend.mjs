import MailService from "@sendgrid/mail";

import dotenv from 'dotenv';
// dotenv.config();

import { configDotenv } from "dotenv";

configDotenv();


MailService.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
    to: 'ishan.sathe@somaiya.edu',
    from: 'ishansatheprofessional@gmail.com',
    subject: 'test email',
    text: 'This email web api provider works. This one was from Send Grid/Twilio.',
    html: '<u>you can also add <strong>html</strong> code if you want to.</u>'
};

MailService
    .send(msg)
    .then(() => {
        console.log("Sent the email!");
    })
    .catch((err) => {
        console.error(err);
    })
