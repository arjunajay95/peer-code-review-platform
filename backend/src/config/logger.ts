import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const level = () => (process.env.NODE_ENV === "production" ? "http" : "debug");

const devFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level}]: ${message}`),
);

const prodFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const logger = winston.createLogger({
  levels,
  level: level(),
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
