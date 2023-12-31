import { RateLimitRequestHandler, rateLimit } from 'express-rate-limit'

const requestLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 1 minute'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message)
  }
})

export default requestLimiter
