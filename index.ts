import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './src/routes/users/routes/auths';
import rootRoutes from './src/routes/root';
import postsRoutes from './src/routes/posts/routes/posts';
import catsRoutes from './src/routes/cats/routes/cats';
import { logger } from './src/middleware/logger';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(bodyParser.json());

// Middleware

// Logger middleware to log requests
app.use(logger);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve static files from the 'public' directory
app.use('/', express.static(path.join(__dirname, 'public')));

// Configure CORS based on the environment
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
    credentials: true, // Allow cookies
  })
);

// Routes

// API routes
app.use('/', rootRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Posts routes
app.use('/api/posts', postsRoutes);

// Cats routes
app.use('/api/cats', catsRoutes);

// Handle 404 Not Found
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('text').send('404 Not Found');
  }
});

// Start the Express app on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
