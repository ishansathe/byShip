import nodemailer from 'nodemailer';
import { configDotenv } from "dotenv";
configDotenv();

let transport = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    auth: {
    user: "emailapikey",
    pass: process.env.zepto_smtp_password
    }
});

let mailOptions = {
    from: '"Byship Team" <byship-team@byship.in>',
    to: 'ishansathe31501@gmail.com',
    subject: 'Regarding verification of non-spam email.',
    html: "I think it's resolved now! This email should be staying out of spam when it reaches you",
};

transport.sendMail(mailOptions, (error, info) => {
    if (error) {
    return console.log(error);
    }
    console.log('Successfully sent');
    console.log(info);
});