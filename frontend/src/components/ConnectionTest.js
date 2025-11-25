import React, { useState } from 'react';
import { Button, Alert, Box, Typography, Card, CardContent } from '@mui/material';
import API from '../utils/api';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');
    
    try {
      const response = await API.get('/health');
      setTestResult(`✅ SUCCESS: ${response.data.message} | Status: ${response.status}`);
      console.log('Health check response:', response.data);
    } catch (error) {
      let errorMessage = `❌ FAILED: `;
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage += 'Network Error - Backend server is not running or not accessible';
      } else if (error.response) {
        errorMessage += `Server responded with status ${error.response.status}`;
      } else {
        errorMessage += error.message;
      }
      
      setTestResult(errorMessage);
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Connection Debugger
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={testConnection} 
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </Button>
        
        {testResult && (
          <Alert 
            severity={testResult.includes('✅') ? 'success' : 'error'}
            sx={{ mt: 1 }}
          >
            {testResult}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Troubleshooting Steps:
          </Typography>
          <Typography variant="body2">
            1. Make sure backend is running on port 5000<br/>
            2. Check if MongoDB is running<br/>
            3. Verify no other services are using port 5000<br/>
            4. Check browser console for CORS errors
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;