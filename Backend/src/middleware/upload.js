import multer from 'multer';
import cloudinaryStorage from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Dynamic Storage Engine
const storage = new cloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    
    return {
      // PDF ke liye 'zencode_pdfs' folder, images ke liye 'aptitude_questions'
      folder: isPdf ? 'zencode_pdfs' : 'aptitude_questions',
      
      // PDF ke liye 'raw' resource type mandatory hai
      resource_type: isPdf ? 'raw' : 'image', 
      
      // Formats allowed based on file type
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'png', 'jpeg', 'gif'],
      
      public_id: `zencode-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { 
    // Vercel limits are tight, keeping it under 5MB for safety
    fileSize: 5 * 1024 * 1024 
  } 
});

export default upload;
