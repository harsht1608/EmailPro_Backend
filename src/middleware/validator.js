const { check, validationResult } = require('express-validator');

// Regex to match valid gmail addresses
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const validateGmail = (req, res, next) => {
    const email = req.body.to;
    if (!email || !gmailRegex.test(email)) {
        return res.status(400).json({ errors: [{ msg: 'invalid email address', param: 'to', location: 'body' }] });
    }
    next();
};

// Custom validation for /send-email
const validateEmailRequest = [
    check('to').isEmail().withMessage('Invalid email address'),
    (req, res, next) => {
        // Only require subject and text if template is not present
        if (!req.body.template) {
            if (!req.body.subject) {
                return res.status(400).json({ errors: [{ msg: 'Subject is required', param: 'subject', location: 'body' }] });
            }
            if (!req.body.text) {
                return res.status(400).json({ errors: [{ msg: 'Email content is required', param: 'text', location: 'body' }] });
            }
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateGmailAndEmailRequest = [validateGmail, ...validateEmailRequest];

module.exports = { validateEmailRequest, validateGmailAndEmailRequest };