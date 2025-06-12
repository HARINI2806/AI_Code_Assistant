import React from 'react';
import FileUploader from '../components/FileUploader';

const EmbedderPage = () => {
  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Embed Your Codebase</h2>
      <FileUploader />
    </div>
    /</div>
  );
};

export default EmbedderPage;