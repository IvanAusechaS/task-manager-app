// Models initialization and MongoDB connection
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// User Model (according to first sprint and current model)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Task Model (according to first sprint and current model)
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Por hacer', 'Haciendo', 'Hecho'], default: 'Por hacer' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// Database connection
async function initDB() {
  try {
    // MongoDB Atlas connection string
    const connectionString = process.env.MONGODB_URI || 'mongodb+srv://JuanRodas:<db_password>@cluster0.n6jrz1x.mongodb.net/TaskManager?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(connectionString);
    console.log('MongoDB Atlas database connected successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

module.exports = { mongoose, User, Task, initDB };
