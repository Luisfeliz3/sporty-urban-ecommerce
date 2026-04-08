const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Check if required environment variables exist
if (!process.env.GCS_BUCKET_NAME) {
  console.error('ERROR: GCS_BUCKET_NAME environment variable is not set');
}

if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
  console.error('ERROR: GOOGLE_CLOUD_KEY_FILE environment variable is not set');
}

// Initialize Google Cloud Storage with better error handling
let storage;
let bucket;

try {
  // Check if key file exists
  const keyFilePath = process.env.GOOGLE_CLOUD_KEY_FILE;
  console.log('Looking for key file at:', keyFilePath);
  
  storage = new Storage({
    keyFilename: keyFilePath,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  });
  
  const bucketName = process.env.GCS_BUCKET_NAME;
  bucket = storage.bucket(bucketName);
  
  console.log(`✅ GCS initialized successfully. Bucket: ${bucketName}`);
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud Storage:', error);
}

// Function to upload file to GCS
const uploadToGCS = async (file, folder = 'products') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!bucket) {
      reject(new Error('GCS bucket not initialized. Check your configuration.'));
      return;
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalName = file.originalname.replace(/\s/g, '_');
    const filename = `${folder}/${timestamp}-${randomString}-${originalName}`;
    
    console.log(`Uploading to GCS: ${filename}`);
    
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadTime: new Date().toISOString(),
        },
      },
    });

    blobStream.on('error', (error) => {
      console.error('GCS upload error:', error);
      reject(error);
    });

    blobStream.on('finish', async () => {
      try {
        // Make the file publicly accessible
        // await blob.makePublic();
        
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        console.log(`File uploaded successfully: ${publicUrl}`);
        
        resolve({
          url: publicUrl,
          filename: filename,
          bucket: bucket.name,
          contentType: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error('Error making file public:', error);
        reject(error);
      }
    });

    blobStream.end(file.buffer);
  });
};

// Function to delete file from GCS
const deleteFromGCS = async (filename) => {
  try {
    if (!bucket) {
      throw new Error('GCS bucket not initialized');
    }
    await bucket.file(filename).delete();
    console.log(`Deleted from GCS: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    return false;
  }
};

// Function to delete multiple files
const deleteMultipleFromGCS = async (filenames) => {
  const results = await Promise.allSettled(
    filenames.map(filename => deleteFromGCS(filename))
  );
  return results;
};

module.exports = {
  uploadToGCS,
  deleteFromGCS,
  deleteMultipleFromGCS,
  bucket,
};