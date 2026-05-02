const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const branchRoutes = require('./routes/branch.routes');
const lockerRoutes = require('./routes/locker.routes');
const customerRoutes = require('./routes/customer.routes');
const allocationRoutes = require('./routes/allocation.routes');
const paymentRoutes = require('./routes/payment.routes');
const accessLogRoutes = require('./routes/accessLog.routes');
const requestRoutes = require('./routes/request.routes');
const reportRoutes = require('./routes/report.routes');
const documentRoutes = require('./routes/document.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

// Security
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/access-logs', accessLogRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
