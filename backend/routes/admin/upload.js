const express = require('express');
const multer = require('multer');
const auth = require('../../middleware/auth');
const { uploadToGCS } = require('../../config/cloudStorage');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware to check if user is admin
const adminRequired = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// @desc    Upload multiple images to Google Cloud Storage
// @route   POST /api/admin/upload/images
// @access  Private/Admin
router.post('/images', auth, adminRequired, upload.array('images', 10), async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files in request');
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = [];
    const errors = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Processing file ${i + 1}:`, file.originalname, file.size, file.mimetype);
      
      try {
        const uploadedImage = await uploadToGCS(file, 'products');
        console.log(`File ${i + 1} uploaded successfully:`, uploadedImage.url);
        uploadedImages.push({
          url: uploadedImage.url,
          filename: uploadedImage.filename,
          contentType: uploadedImage.contentType,
          size: uploadedImage.size,
          isPrimary: i === 0
        });
      } catch (uploadError) {
        console.error(`Error uploading file ${i + 1}:`, uploadError);
        errors.push({
          file: file.originalname,
          error: uploadError.message
        });
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload any images',
        errors: errors
      });
    }

    res.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images: ' + error.message
    });
  }
});

// Single image upload endpoint
router.post('/image', auth, adminRequired, upload.single('image'), async (req, res) => {
  try {
    console.log('=== SINGLE UPLOAD REQUEST ===');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const uploadedImage = await uploadToGCS(req.file, 'products');
    
    res.json({
      success: true,
      data: {
        url: uploadedImage.url,
        filename: uploadedImage.filename,
        contentType: uploadedImage.contentType,
        size: uploadedImage.size
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image: ' + error.message
    });
  }
});

module.exports = router;