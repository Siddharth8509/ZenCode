import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtmj84y0y', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dynamic Storage Engine
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    
    const params = {
      folder: isPdf ? 'zencode_pdfs' : 'aptitude_questions',
      resource_type: 'auto', // Letting Cloudinary decide is generally safer and faster
      public_id: `zencode-${Date.now()}-${file.originalname.split('.')[0]}`,
    };

    // allowed_formats should only be provided for images/videos, not 'raw' files (PDFs)
    if (!isPdf) {
      params.allowed_formats = ['jpg', 'png', 'jpeg', 'gif'];
    }

    return params;
  },
});

const upload = multer({ 
  storage: storage,
  limits: { 
    // Increased to 10MB for larger PDF question papers
    fileSize: 10 * 1024 * 1024 
  } 
});

export default upload;
