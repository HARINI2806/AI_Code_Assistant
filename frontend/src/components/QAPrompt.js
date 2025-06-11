// src/components/QAPrompt.js
import React, { useState } from 'react';
import axios from 'axios';

const QAPrompt = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/qa', { question });
      setAnswer(res.data.answer || 'No answer returned.');
    } catch (err) {
      setAnswer('Error fetching answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Ask a Question</h3>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something about your codebase..."
        rows={3}
        className="w-full border p-3 rounded"
      />

      <button
        onClick={handleAsk}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? 'Asking...' : 'Ask'}
      </button>

      {answer && (
        <div className="mt-6 bg-gray-100 p-4 rounded border">
          <strong className="block mb-2">Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default QAPrompt;
