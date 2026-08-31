const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

const globalErrorHandler = require('./utils/globalErrorHandler');

const taskRoutes = require('./routes/taskRoutes');
const notiRoutes = require('./routes/notiRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(helmet());

app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use(express.json({ limit: '10kb' }));

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
},
  express.static(path.join(__dirname, 'public', 'uploads'))
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/noti', notiRoutes);
app.use('/api/v1/auth', authRoutes);

app.use(globalErrorHandler);

module.exports = app;