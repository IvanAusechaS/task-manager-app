import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Por hacer', 'Haciendo', 'Hecho'], default: 'Por hacer' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);