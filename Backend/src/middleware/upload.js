import multer from 'multer';
import cloudinaryStorage from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Dynamic Storage Engine
const storage = new cloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    
    const params = {
      folder: isPdf ? 'zencode_pdfs' : 'aptitude_questions',
      resource_type: 'auto',
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
    // 10MB for server-side uploads (aptitude images/questions)
    fileSize: 10 * 1024 * 1024 
  } 
});

export default upload;
