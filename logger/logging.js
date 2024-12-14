const winston = require('winston');
const { combine, timestamp, json, printf, errors } = winston.format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    return JSON.stringify({
        timestamp,
        level,
        message: stack || message, // Include stack trace if available
        ...metadata,
    }, null, 2); // Pretty-print the output for better readability
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Capture stack traces for error logs
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json() // Default JSON format for file logs
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat // Use custom console format
      ),
    }),
    new winston.transports.File({ 
      filename: 'logs/server.log', 
      format: json() // JSON format for structured logging
    }),
  ],
});

module.exports = logger;
