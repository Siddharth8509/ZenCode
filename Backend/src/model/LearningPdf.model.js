import mongoose from 'mongoose';

const learningPdfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['OS', 'DBMS', 'CN', 'Other'],
        default: 'Other'
    },
    pdfUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, { timestamps: true });

export const LearningPdf = mongoose.model('LearningPdf', learningPdfSchema);
