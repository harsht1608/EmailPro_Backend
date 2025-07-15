const transporter = require('../config/mail.config');

class MailController {
    async sendEmail(to, subject, text) {
        const mailOptions = {
            from: process.env.MAIL_SERVICE_FROM,
            to: to,
            subject: subject,
            text: text
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            throw error;
        }
    }
}

module.exports = MailController;