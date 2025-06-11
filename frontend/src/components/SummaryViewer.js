// src/components/SummaryDisplay.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SummaryDisplay = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/summary');
        setSummaries(res.data.summaries || []);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Codebase Summary</h3>
      {loading ? (
        <p>Loading summaries...</p>
      ) : summaries.length > 0 ? (
        <div className="space-y-4">
          {summaries.map((item, index) => (
            <div key={index} className="border p-4 rounded bg-gray-50">
              <h4 className="font-bold text-lg">{item.filename}</h4>
              <p className="mt-2 text-sm whitespace-pre-wrap">{item.summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No summaries available. Make sure the codebase is embedded and summarized.</p>
      )}
    </div>
  );
};

export default SummaryDisplay;
