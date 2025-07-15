const express = require('express');
const MailController = require('../controllers/mailController');
const axios = require('axios');
require('dotenv').config();
const { validateGmailAndEmailRequest } = require('../middleware/validator');
const rateLimiter = require('../middleware/rateLimiter');
const fs = require('fs');
const path = require('path');

const setMailRoutes = (app) => {
    const mailController = new MailController();

    app.use(rateLimiter); // Apply rate limiting middleware

    // Email verification route
    app.get('/verify-email/:email', async (req, res) => {
        try {
            const email = req.params.email;
            const response = await axios.get(`https://api.hunter.io/v2/email-verifier`, {
                params: {
                    email: email,
                    api_key: process.env.HUNTER_API_KEY
                }
            });

            const verificationResult = {
                isValid: response.data.data.status === 'valid',
                score: response.data.data.score,
                status: response.data.data.status,
                details: {
                    disposable: response.data.data.disposable,
                    webmail: response.data.data.webmail,
                    smtp_check: response.data.data.smtp_check,
                    mx_records: response.data.data.mx_records
                },
                safe_to_send: response.data.data.status === 'valid' && response.data.data.score > 50
            };

            res.status(200).json(verificationResult);
        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                error: 'Failed to verify email',
                message: error.message
            });
        }
    });

    // AI Email Content Generation route
    app.post('/generate-email-content', async (req, res) => {
        try {
            const { prompt } = req.body;
            const response = await axios.post('http://localhost:5000/api/message/generate', {
                recipientType: "customer",
                tone: "friendly",
                purpose: prompt
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // response.data.response is the generated text from Gemini
            let generatedText = response.data.response || "";

            // Try to extract subject line from the generated text
            let subject = "AI Generated Email";
            let message = generatedText;

            // If the AI response starts with "Subject: ..." or "Subject - ...", extract it
            const subjectMatch = generatedText.match(/^\s*Subject[:\-]\s*(.+)\s*\n/i);
            if (subjectMatch) {
                subject = subjectMatch[1].trim();
                message = generatedText.replace(subjectMatch[0], '').trim();
            }

            res.status(200).json({
                success: true,
                generatedContent: {
                    subject,
                    message,
                    tone: "friendly",
                    wordCount: message.split(/\s+/).length
                }
            });
        } catch (error) {
            console.error('AI content generation error:', error);
            res.status(500).json({
                error: 'Failed to generate email content',
                message: error.message
            });
        }
    });

    // GET route to show available email options
    app.get('/email-options', (req, res) => {
        const availableOptions = {
            options: [
                {
                    id: 1,
                    type: "Email Verification",
                    endpoint: "/verify-email/:email",
                    method: "GET",
                    description: "Verify email address validity and safety using Hunter.io.",
                    example: "/verify-email/test@example.com",
                    responseFormat: {
                        isValid: "boolean",
                        score: "number (0-100)",
                        status: "string",
                        safe_to_send: "boolean",
                        details: {
                            disposable: "boolean",
                            webmail: "boolean",
                            smtp_check: "boolean",
                            mx_records: "boolean"
                        }
                    }
                },
                {
                    id: 2,
                    type: "Send Email",
                    endpoint: "/send-email",
                    method: "POST",
                    description: "Send a basic or template-based email. If a template is provided, variables will be replaced.",
                    requiredFields: {
                        to: "Recipient email address",
                        subject: "Email subject (ignored if template is used)",
                        text: "Email content (ignored if template is used)",
                        template: "Template filename (optional)",
                        variables: "Object with template variables (optional)"
                    },
                    example: {
                        to: "recipient@example.com",
                        subject: "Hello",
                        text: "This is a test email.",
                        template: "event_followup.json",
                        variables: {
                            user_name: "Harsh",
                            user_email: "harsh@example.com",
                            first_name: "John",
                            event_name: "Tech Summit",
                            learning_point: "your insights on AI",
                            availability: "next week"
                        }
                    }
                },
                {
                    id: 3,
                    type: "List Email Templates",
                    endpoint: "/email-templates",
                    method: "GET",
                    description: "List all available email templates in a hierarchical structure.",
                    responseFormat: {
                        templates: {
                            "Follow-up": "object",
                            "Networking": "object"
                        }
                    }
                },
                {
                    id: 4,
                    type: "Get Template Content",
                    endpoint: "/email-templates/:filename",
                    method: "GET",
                    description: "Get the content of a specific template JSON file by filename.",
                    example: "/email-templates/event_followup.json",
                    responseFormat: {
                        template_name: "string",
                        from: "object",
                        subject: "string",
                        message: "string",
                        variables: "array",
                        category: "string"
                    }
                },
                {
                    id: 5,
                    type: "AI Email Generator",
                    endpoint: "/generate-email-content",
                    method: "POST",
                    description: "Generate personalized email content using AI.",
                    requiredFields: {
                        prompt: "Description of the email you want to generate"
                    },
                    example: {
                        prompt: "Write a professional email to schedule a team meeting"
                    },
                    responseFormat: {
                        success: "boolean",
                        generatedContent: "AI generated email content"
                    }
                }
            ]
        };
        res.status(200).json(availableOptions);
    });

    // Existing POST route for sending test emails
    app.post('/send-email', validateGmailAndEmailRequest, async (req, res) => {
        const { to, subject, text, template, variables, openInGmail } = req.body;

        // Helper to recursively search for the file
        function findFile(dir, filename) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    const result = findFile(fullPath, filename);
                    if (result) return result;
                } else if (item.isFile() && item.name === filename) {
                    return fullPath;
                }
            }
            return null;
        }

        // Helper to replace variables in all string fields
        function deepReplace(obj, params) {
            if (typeof obj === 'string') {
                return obj.replace(/{{(.*?)}}/g, (_, v) => params[v.trim()] || `{{${v}}}`);
            } else if (Array.isArray(obj)) {
                return obj.map(item => deepReplace(item, params));
            } else if (typeof obj === 'object' && obj !== null) {
                const newObj = {};
                for (const key in obj) {
                    newObj[key] = deepReplace(obj[key], params);
                }
                return newObj;
            }
            return obj;
        }

        try {
            let finalSubject = subject;
            let finalText = text;

            if (template) {
                const followUpDir = path.join(__dirname, '../templates/Follow-up');
                const networkingDir = path.join(__dirname, '../templates/Networking');
                const foundPath = findFile(followUpDir, template) || findFile(networkingDir, template);

                if (!foundPath) {
                    return res.status(404).json({ error: 'Template not found' });
                }

                const fileContent = fs.readFileSync(foundPath, 'utf-8');
                const parsedContent = JSON.parse(fileContent);
                const filledTemplate = deepReplace(parsedContent, variables || {});

                finalSubject = filledTemplate.subject;
                finalText = filledTemplate.message;
            }

            if (openInGmail) {
                // Construct Gmail compose URL
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalText)}`;
                return res.json({ gmailUrl });
            }

            try {
                await mailController.sendEmail(to, finalSubject, finalText);
                res.status(200).send('Email sent successfully');
            } catch (error) {
                res.status(500).send(`Error sending email: ${error.message}`);
            }
        } catch (error) {
            res.status(500).send(`Error sending email: ${error.message}`);
        }
    });

    // Route to list all available templates hierarchically
    app.get('/email-templates', (req, res) => {
        const followUpDir = path.join(__dirname, '../templates/Follow-up');
        const networkingDir = path.join(__dirname, '../templates/Networking');

        function readTemplates(dir) {
            const structure = { files: [], children: [] };
            if (!fs.existsSync(dir)) return structure;
            const items = fs.readdirSync(dir, { withFileTypes: true });
            items.forEach(item => {
                if (item.isDirectory()) {
                    structure.children.push({
                        name: item.name,
                        ...readTemplates(path.join(dir, item.name))
                    });
                } else if (item.isFile() && item.name.endsWith('.json')) {
                    structure.files.push(item.name);
                }
            });
            return structure;
        }

        try {
            const hierarchy = {
                templates: {
                    'Follow-up': readTemplates(followUpDir),
                    'Networking': readTemplates(networkingDir)
                }
            };
            res.json(hierarchy);
        } catch (err) {
            res.status(500).json({ error: 'Failed to read templates', message: err.message });
        }
    });

    // Route to get the content of a specific template JSON file by name (searches recursively)
    app.get('/email-templates/:filename', (req, res) => {
        const followUpDir = path.join(__dirname, '../templates/Follow-up');
        const networkingDir = path.join(__dirname, '../templates/Networking');

        const { filename } = req.params;

        // Helper to recursively search for the file
        function findFile(dir) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    const result = findFile(fullPath);
                    if (result) return result;
                } else if (item.isFile() && item.name === filename) {
                    return fullPath;
                }
            }
            return null;
        }

        try {
            const foundPath = findFile(followUpDir) || findFile(networkingDir);
            if (!foundPath) {
                return res.status(404).json({ error: 'Template not found' });
            }
            const fileContent = fs.readFileSync(foundPath, 'utf-8');
            res.type('application/json').send(fileContent);
        } catch (err) {
            res.status(500).json({ error: 'Failed to read template', message: err.message });
        }
    });
};

module.exports = { setMailRoutes };