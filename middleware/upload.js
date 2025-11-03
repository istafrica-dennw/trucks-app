import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'payment-proofs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware for single payment proof upload (for full payment or installment)
// Field name can be 'attachment' (for installments) or 'pay[attachment]' (for full payment)
export const uploadPaymentProof = (req, res, next) => {
  // Try 'pay[attachment]' first (for full payment), then fall back to 'attachment' (for installments)
  const uploadSingle = upload.fields([
    { name: 'pay[attachment]', maxCount: 1 },
    { name: 'attachment', maxCount: 1 }
  ]);

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.warn('Multer error during file upload', { error: err.message, code: err.code });
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      logger.error('Unknown error during file upload', { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: err.message });
    }
    
    // Normalize file to req.file for consistency
    if (req.files && req.files['pay[attachment]'] && req.files['pay[attachment]'][0]) {
      req.file = req.files['pay[attachment]'][0];
    } else if (req.files && req.files['attachment'] && req.files['attachment'][0]) {
      req.file = req.files['attachment'][0];
    }
    
    next();
  });
};

export default upload;
