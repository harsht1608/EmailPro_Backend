const validateEnv = () => {
    const required = [
        'MAIL_SERVICE_USER',
        'MAIL_SERVICE_PASS',
        'MAIL_SERVICE_HOST',
        'MAIL_SERVICE_PORT',
        'MAIL_SERVICE_FROM',
        'HUNTER_API_KEY',
        'GEMINI_API_KEY',
        'MONGO_URI'
    ];

    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
};

module.exports = validateEnv;