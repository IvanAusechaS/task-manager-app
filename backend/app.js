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

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configuración mejorada de CORS para soportar tanto desarrollo como producción
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',           // Desarrollo local Vite
            'http://localhost:3001',           // Desarrollo local Express
            'https://tidytasks-v1.onrender.com' // Frontend en producción (Render)
        ];
        
        // Permitir solicitudes sin origen (como aplicaciones móviles o postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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