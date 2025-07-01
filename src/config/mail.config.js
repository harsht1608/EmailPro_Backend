require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE_HOST,
    port: process.env.MAIL_SERVICE_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_SERVICE_USER,
        pass: process.env.MAIL_SERVICE_PASS
    }
});

module.exports = transporter;