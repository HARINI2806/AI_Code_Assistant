// src/components/FileUploader.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a zip file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading and embedding...');
      const res = await axios.post('http://localhost:8000/embed/embed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus(res.data.message || 'Embedding completed.');
    } catch (err) {
      setStatus('Upload failed: ' + err.message);
    }
  };

  const handleDefaultEmbed = async () => {
    try {
      setStatus('Embedding default codebase...');
      const res = await axios.post('http://localhost:8000/embed/embed');
      setStatus(res.data.message || 'Default codebase embedded.');
    } catch (err) {
      setStatus('Embedding failed: ' + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-xl mx-auto">
      <label className="block mb-2 font-medium text-gray-700">
        Upload zipped codebase:
      </label>
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="block mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded px-4 py-2"
      />
      <br/>
      <div className="flex gap-4">
         <br/>
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload & Embed
        </button>
        <button
          onClick={handleDefaultEmbed}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Use Default Sample
        </button>
      </div>
      <br />
      {status && (
        <p className="mt-4 text-sm text-blue-700 bg-blue-50 p-2 rounded">
          {status}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
