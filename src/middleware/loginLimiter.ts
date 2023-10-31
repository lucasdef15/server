import rateLimit from 'express-rate-limit';
import { logEvents } from './logger';

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // Limit each IP to 5 login request per 'window' per minute
  message: {
    message:
      'Too many login attempts from this IP, please try again after 60 second',
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errLog.log'
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in 'RateLimit-*' headers
  legacyHeaders: false, //Disabe the 'X-RateLimit-*' headers
});

export default loginLimiter;
