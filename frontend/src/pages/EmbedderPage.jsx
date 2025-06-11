import React from 'react';
import FileUploader from '../components/FileUploader';

const EmbedderPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Embed Your Codebase</h2>
      <FileUploader />
    </div>
  );
};

export default EmbedderPage;