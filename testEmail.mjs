import nodemailer from 'nodemailer';
let transport = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    auth: {
    user: "emailapikey",
    pass: "PHtE6r1eRerq3299phkCsPa/HsGlNNsv+exuKgAR5d4RXvMHHE1X/4oixz7iox1/APhHQqXNyow64OzP4ujTJj28MGxLXWqyqK3sx/VYSPOZsbq6x00esFseckXfUYbnetNo3SPQuNuX"
    }
});

let mailOptions = {
    from: '"Byship Team" <byship-team@byship.in>',
    to: 'mihikajain645@gmail.com',
    subject: 'Regarding verification of non-spam email.',
    html: "I think it's resolved now! This email should be staying out of spam when it reaches you",
};

transport.sendMail(mailOptions, (error, info) => {
    if (error) {
    return console.log(error);
    }
    console.log('Successfully sent');
});