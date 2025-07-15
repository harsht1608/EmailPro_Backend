require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setMailRoutes } = require('./routes/mailRoutes');
const { setMessageRoutes } = require('./routes/messageRoutes');
const validateEnv = require('./config/envValidator');
const requestLogger = require('./config/logger');

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

setMailRoutes(app);
setMessageRoutes(app);

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});