require('dotenv').config();
const { uploadToGCS } = require('./config/cloudStorage');
const path = require('path');
const fs = require('fs');

async function testGCS() {
  console.log('Testing GCS connection...');
  console.log('Bucket:', process.env.GCS_BUCKET_NAME);
  console.log('Key file:', process.env.GOOGLE_CLOUD_KEY_FILE);
  
  // Create a simple test buffer
  const testBuffer = Buffer.from('test');
  const testFile = {
    buffer: testBuffer,
    originalname: 'test.txt',
    mimetype: 'text/plain',
    size: testBuffer.length
  };
  
  try {
    const result = await uploadToGCS(testFile, 'test');
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

testGCS();