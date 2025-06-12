// src/pages/PDFGeneratorPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PDFViewer from '../components/PDFViewer';

const PDFGeneratorPage = () => {
  const [codebases, setCodebases] = useState([]);
  const [selectedCodebase, setSelectedCodebase] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    const fetchCodebases = async () => {
      try {
        const res = await axios.get('http://localhost:8000/pdf/pdf/codebases');
        setCodebases(res.data.codebases);
      } catch (err) {
        console.error('Failed to fetch codebases:', err);
      }
    };

    fetchCodebases();
  }, []);

  const handleGeneratePDF = async () => {
    if (!selectedCodebase) return;
    try {
      const res = await axios.post('http://localhost:8000/pdf/pdf', {
        codebase_path: `./sample-codebase/${selectedCodebase}`,
      });
      if (res.data?.file_path) {
        setPdfUrl('http://localhost:8000/pdf/pdf');
        setDownloadUrl('http://localhost:8000/pdf/pdf/download');
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Generate Codebase Summary PDF</h2>

      <div className="flex items-center gap-4">
        <select
          value={selectedCodebase}
          onChange={(e) => setSelectedCodebase(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select a codebase</option>
          {codebases.map((cb) => (
            <option key={cb} value={cb}>
              {cb}
            </option>
          ))}
        </select>

        <button
          onClick={handleGeneratePDF}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!selectedCodebase}
        >
          Generate PDF
        </button>
      </div>

      {pdfUrl && downloadUrl && (
        <PDFViewer fileUrl={pdfUrl} downloadUrl={downloadUrl} />
      )}
  );
};

export default PDFGeneratorPage;
