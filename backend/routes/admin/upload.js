const express = require('express');
const multer = require('multer');
const auth = require('../../middleware/auth');
const { uploadToGCS, deleteMultipleFromGCS } = require('../../config/cloudStorage');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
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

// @desc    Upload multiple images to GCS
// @route   POST /api/admin/upload/images
// @access  Private/Admin
router.post('/images', auth, adminRequired, upload.array('images', 10), async (req, res) => {
  try {
    console.log('=== UPLOAD IMAGES REQUEST ===');
    console.log('Files received:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedImages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Processing file ${i + 1}:`, {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      });
      
      try {
        // Upload to GCS
        const result = await uploadToGCS(file, 'products');
        
        uploadedImages.push({
          url: result.url,
          filename: result.filename,
          contentType: result.contentType,
          size: result.size,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
        
        console.log(`✅ Image ${i + 1} uploaded: ${result.url}`);
      } catch (uploadError) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadError.message);
        // Continue with other images
      }
    }
    
    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload any images'
      });
    }
    
    console.log(`✅ Successfully uploaded ${uploadedImages.length} images`);
    console.log('Response data:', JSON.stringify(uploadedImages, null, 2));
    
    res.status(200).json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images: ' + error.message
    });
  }
});

// @desc    Delete images from GCS
// @route   DELETE /api/admin/upload/images
// @access  Private/Admin
router.delete('/images', auth, adminRequired, async (req, res) => {
  try {
    const { filenames } = req.body;
    
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No filenames provided'
      });
    }
    
    await deleteMultipleFromGCS(filenames);
    
    res.json({
      success: true,
      message: `${filenames.length} image(s) deleted successfully`
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting images: ' + error.message
    });
  }
});

module.exports = router;