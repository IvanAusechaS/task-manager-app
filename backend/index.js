import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Import routes
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


app.get('/', (req, res) => {
  res.send('Task Manager Backend is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});