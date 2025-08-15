import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ExcelUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadErrors, setUploadErrors] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Validate file
  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Please select a valid Excel file (.xlsx or .xls)');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File size must be less than 10MB');
    }
  };

  // Handle file upload
  const handleFile = async (file) => {
    try {
      validateFile(file);
      
      // Debug log to check authentication state
      console.log("Current user:", user);
      console.log("Is admin:", user?.role === 'admin');
      console.log("Token exists:", !!localStorage.getItem('token'));
      
      setUploading(true);
      setUploadResult(null);
      setUploadErrors(null);

      // Convert file to base64 to avoid multipart/form-data issues
      const reader = new FileReader();
      
      // Create a promise to handle the file reading
      const fileReadPromise = new Promise((resolve, reject) => {
        reader.onload = () => {
          // Get base64 part without mime type prefix
          const base64Data = reader.result.split(',')[1]; 
          console.log('File read successfully, base64 length:', base64Data.length);
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          reject(error);
        };
      });
      
      // Read the file as data URL (base64)
      reader.readAsDataURL(file);
      console.log('Reading file as data URL...');
      
      // Wait for file to be read
      const base64Data = await fileReadPromise;
      
      // Send as JSON instead of form-data
      console.log('Sending request with file:', file.name, 'and data length:', base64Data.length);
      console.log('Starting upload with 60-second timeout...');
      
      const startTime = new Date();
      const response = await api.post('/excel/upload', {
        fileData: base64Data,
        fileName: file.name
      });
      
      const endTime = new Date();
      const processingTime = (endTime - startTime) / 1000;
      console.log(`Upload completed successfully in ${processingTime} seconds`);

      // Success - no errors or the errors array is empty
      setUploadResult(response.data);
      console.log('Upload result:', response.data);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Add debug information
      console.log('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      
      if (error.code === 'ECONNABORTED') {
        setUploadErrors({
          success: false,
          message: 'The upload request timed out. The server may still be processing your file.',
          errors: [{
            msg: 'Try refreshing the page in a few minutes to see if the upload completed successfully. If not, try uploading a smaller file or contact support.'
          }]
        });
      } else if (error.response?.status === 403) {
        setUploadErrors({
          success: false,
          message: 'Permission denied. Make sure you are logged in with admin privileges.',
          errors: [{
            msg: 'Authorization failed. Please try logging out and logging back in.'
          }]
        });
      } else if (error.response?.data) {
        // Use the complete error response from the server
        // Ensure errors array is present and properly formatted
        const responseData = error.response.data;
        
        // Make sure errors array exists and is formatted correctly
        if (!responseData.errors) {
          responseData.errors = [];
        } else if (!Array.isArray(responseData.errors)) {
          // If errors exists but is not an array, convert it to array
          responseData.errors = [responseData.errors];
        }
        
        setUploadErrors(responseData);
      } else {
        // Fallback if no response data
        setUploadErrors({
          success: false,
          message: error.message || 'Upload failed',
          errors: [{
            msg: `Failed to upload file: ${error.message}. ${error.code === 'ECONNABORTED' ? 'The request timed out, but the server might still be processing your file.' : 'Please try again or contact support.'}`
          }]
        });
      }
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      console.log("Attempting to download template as user:", user?.email, "with role:", user?.role);
      console.log("Token exists:", !!localStorage.getItem('token'));
      
      const token = localStorage.getItem('token');
      console.log("Token header:", token ? `Bearer ${token.substring(0, 10)}...` : 'No token');
      
      const response = await api.get('/excel/template', {
        responseType: 'blob',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employee_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      console.log('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        message: error.message
      });
      alert('Failed to download template: ' + (error.message || 'Unknown error'));
    }
  };

  // Clear results
  const handleClearResults = () => {
    setUploadResult(null);
    setUploadErrors(null);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">This feature is only available to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                background: 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-deep-blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Excel Import
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Upload employee data from Excel files</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: 'linear-gradient(135deg, var(--mic-logo-green), #27ae60)',
                color: 'var(--mic-white)'
              }}
              className="px-6 py-3 text-white rounded-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Employee Data</h3>
              <p className="text-gray-600">Drag and drop your Excel file or click to browse</p>
            </div>

            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50 scale-105' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <LoadingSpinner />
                  </div>
                  <p className="text-lg font-medium text-purple-600">Processing Excel file...</p>
                  <p className="text-sm text-gray-600">
                    This may take up to a minute for large files. 
                    <br />Please don't refresh the page.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }} className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        {dragActive ? 'Drop your Excel file here' : 'Drop your Excel file here, or'}
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Browse Files
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Supported formats: .xlsx, .xls</p>
                      <p>Maximum file size: 10MB</p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Download the template above to see the required column format
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Required fields: First Name, Last Name, Email, Department, Role, and Password
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Employee ID is optional and will be generated automatically if not provided
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Role must be either 'employee' or 'hod' (Head of Department)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Password must be at least 6 characters long
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Make sure the department names are consistent with existing departments
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Result */}
        {uploadResult && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Upload Successful!</h3>
                  <p className="text-green-100">{uploadResult.message}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{uploadResult.successful || 0}</div>
                  <div className="text-green-700 font-medium">Users Imported</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {(uploadResult.successful || 0) + (uploadResult.errors?.length || 0)}
                  </div>
                  <div className="text-blue-700 font-medium">Total Processed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {uploadResult.errors?.length ? 
                      `${Math.round((uploadResult.successful / ((uploadResult.successful || 0) + (uploadResult.errors?.length || 0))) * 100)}%` 
                      : '100%'}
                  </div>
                  <div className="text-purple-700 font-medium">Success Rate</div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleClearResults}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Result */}
        {uploadErrors && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5C2.962 17.333 3.924 19 5.464 19z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Upload Failed</h3>
                  <p className="text-red-100">{uploadErrors.message}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {uploadErrors.errors && Array.isArray(uploadErrors.errors) && uploadErrors.errors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Validation Errors:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {uploadErrors.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-800">
                            {typeof error === 'string' 
                              ? error 
                              : `Row ${error.row || 'Unknown'}`}
                          </span>
                        </div>
                        {error.errors && Array.isArray(error.errors) && (
                          <ul className="text-sm text-red-700 space-y-1">
                            {error.errors.map((err, errIndex) => (
                              <li key={errIndex} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {typeof err === 'string' ? err : JSON.stringify(err)}
                              </li>
                            ))}
                          </ul>
                        )}
                        {typeof error === 'object' && !error.errors && (
                          <ul className="text-sm text-red-700 space-y-1">
                            <li className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {error.msg || JSON.stringify(error)}
                            </li>
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadErrors.existingEmails && Array.isArray(uploadErrors.existingEmails) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Existing Emails:</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 mb-2">The following emails already exist in the database:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {uploadErrors.existingEmails.map((email, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-yellow-500 mr-2">•</span>
                          {email}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleClearResults}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear Errors
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ExcelUpload;
