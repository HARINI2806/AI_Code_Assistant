// src/components/PDFViewer.js
import React, { useState } from 'react';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PDFViewer = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    try {
      setLoading(true);
      await axios.post('/api/pdf/generate');
      setPdfUrl('/api/pdf/download');
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    window.open('/api/pdf/download', '_blank');
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {pdfUrl && (
        <div className="border mt-4" style={{ height: '700px' }}>
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
