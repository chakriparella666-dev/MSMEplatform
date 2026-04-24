require('dotenv').config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'  // Fix SSL on Windows + Node 22

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const passport     = require('passport')
const compression  = require('compression')
const connectDB    = require('./config/db')
require('./config/passport')

// Connect to Database
connectDB()

// Handle uncaught exceptions (synchronous)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.error(err.name, err.message)
  process.exit(1)
})

const morgan = require('morgan')
const app = express()

// Request logging
app.use(morgan('dev'))

// Rocket-Fast performance middle-wares
app.use(compression()) // Compresses all responses
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ 
  origin: [
    process.env.CLIENT_URL, 
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "http://localhost:3000",
    "http://localhost:3001"
  ], 
  credentials: true 
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(passport.initialize())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/userRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/schemes', require('./routes/schemeRoutes'))

app.get('/health', (req, res) => res.json({ status: 'MSME API running ✅' }))

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`)
  console.error(err.stack)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map(val => val.message).join(', ')
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} already exists`
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  res.status(statusCode).json({ success: false, message })
})

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`🚀 Rocket Server running on port ${PORT}`))

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...')
  console.error(err.name, err.message)
  server.close(() => process.exit(1))
})

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
})
