import winston from "winston";

const isVercel = process.env.VERCEL === '1';
// const isProduction = process.env.NODE_ENV === 'production';

// Base logger configuration
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    level: 'info',
    transports: [
        // Always use console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    ]
});

// Only add file transports when NOT in Vercel
if (!isVercel) {
    logger.add(new winston.transports.File({
        filename: "logs/error.log", 
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: "logs/combined.log"
    }));
    
    console.log('File logging enabled for local development');
} else {
    console.log('Running in Vercel - file logging disabled');
}

export default logger;