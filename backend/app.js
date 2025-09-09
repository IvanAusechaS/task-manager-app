import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import './config/passport.js';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import configureRenderDeployment from './render-specific.js';

// Configurar path para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to database
connectDB();

// Debug environment variables
console.log('Environment Check:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Missing');
console.log('PORT:', process.env.PORT ? '✓ Loaded' : '✗ Missing');

// Verify environment variables are loaded
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const app = express();

// Primero aplicar la configuración específica para Render
// Esto debe ir antes de cualquier otro middleware
if (process.env.NODE_ENV === 'production') {
  configureRenderDeployment(app);
  console.log('✅ Configuración específica para Render aplicada');
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Si estamos en desarrollo, usar configuración CORS estándar
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Aplicando middleware CORS para desarrollo...');
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Task Manager Backend is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;