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

// Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Rocket Server running on port ${PORT}`))
