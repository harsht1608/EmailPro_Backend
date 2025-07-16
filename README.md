# Merged Email and Message Generation Service

This project combines an email service and a message generation service into a single application. It allows users to send emails, verify email addresses, and generate personalized messages using the Gemini API.

## Project Structure

```
Backend/
├── src/
│   ├── app.js                  # Entry point of the application
│   ├── config/                 # Configuration files
│   │   ├── envValidator.js     # Validates environment variables
│   │   ├── logger.js           # Middleware for logging requests
│   │   └── mail.config.js      # Configures nodemailer transporter
│   ├── controllers/            # Controllers for handling business logic
│   │   └── mailController.js   # Handles email sending logic
│   ├── middleware/             # Middleware functions
│   │   ├── rateLimiter.js      # Rate limiting middleware
│   │   └── validator.js        # Validation middleware for email requests
│   ├── models/                 # Mongoose models
│   │   └── Message.js          # Defines the Message schema
│   ├── routes/                 # Route definitions
│   │   ├── mailRoutes.js       # Routes for email functionalities
│   │   └── messageRoutes.js    # Routes for message generation
│   └── templates/              # Email templates
│       ├── Follow-up/
│       │   ├── Networking_follow_up/
│       │   │   ├── event_followup.json
│       │   │   └── re.json
│       │   └── Sales_follow_up/
│       │       ├── appropriate_person.json
│       │       └── your_thoughts.json
│       └── Networking/
│           ├── Referral/
│           │   ├── trying_connect.json
│           │   └── contact_info.json
│           └── Introduction/
│               ├── reaching_out.json
│               └── introucing.json
├── .env                        # Environment variables
├── package.json                # NPM configuration file
├── package-lock.json           # NPM lock file
├── .gitignore                  # Git ignore file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add the required environment variables. Refer to the `.env.example` file for guidance.

4. **Run the application:**
   ```sh
   npm start
   ```

5. **Access the API:**
   The application will be running on `http://localhost:3000`. You can access the following endpoints:
   - **Email Verification:** `GET /verify-email/:email`
   - **Generate Email Content:** `POST /generate-email-content`
   - **Send Email:** `POST /send-email`
   - **Generate Message:** `POST /api/message/generate`
   - **List Email Templates:** `GET /email-templates`
   - **Get Template Content:** `GET /email-templates/:filename`
   - **Email Options:** `GET /email-options`

## Usage

- Use the email service to send emails and verify email addresses.
- Utilize the message generation service to create personalized messages based on user input.
- Explore and use various email templates for different scenarios.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.