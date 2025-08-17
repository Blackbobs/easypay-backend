import winston from "winston";

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        new winston.transports.File({filename: "logs/error.log", level: 'error'}),
        new winston.transports.File({filename: "logs/combined.log"})
    ]
})
export default logger