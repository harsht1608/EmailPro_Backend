# Merged Email and Message Generation Service

This project combines an email service and a message generation service into a single application. It allows users to send emails, verify email addresses, and generate personalized messages using the Gemini API.

## Project Structure

```
merged-app
├── src
│   ├── app.js                  # Entry point of the application
│   ├── config                  # Configuration files
│   │   ├── envValidator.js     # Validates environment variables
│   │   ├── logger.js           # Middleware for logging requests
│   │   └── mail.config.js      # Configures nodemailer transporter
│   ├── controllers             # Controllers for handling business logic
│   │   └── mailController.js    # Handles email sending logic
│   ├── middleware              # Middleware functions
│   │   ├── rateLimiter.js      # Rate limiting middleware
│   │   └── validator.js        # Validation middleware for email requests
│   ├── models                  # Mongoose models
│   │   └── Message.js          # Defines the Message schema
│   ├── routes                  # Route definitions
│   │   ├── mailRoutes.js       # Routes for email functionalities
│   │   └── messageRoutes.js    # Routes for message generation
│   └── templates               # Email templates
│       ├── welcomeTemplate.js   # Welcome email template
│       └── Follow-up           # Follow-up email templates
│           ├── Networking_follow_up
│           │   ├── event_followup.json
│           │   └── re.json
│           └── Sales_follow_up
│               ├── appropriate_person.json
│               └── your_thoughts.json
├── .env                        # Environment variables
├── package.json                # NPM configuration file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd merged-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add the required environment variables. Refer to the `.env.example` file for guidance.

4. **Run the application:**
   ```
   npm start
   ```

5. **Access the API:**
   The application will be running on `http://localhost:3000`. You can access the following endpoints:
   - **Email Verification:** `GET /verify-email/:email`
   - **Generate Email Content:** `POST /generate-email-content`
   - **Send Email:** `POST /send-email`
   - **Generate Message:** `POST /api/message/generate`

## Usage

- Use the email service to send emails and verify email addresses.
- Utilize the message generation service to create personalized messages based on user input.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.