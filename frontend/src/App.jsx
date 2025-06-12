// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import EmbedderPage from './pages/EmbedderPage';
import PDFGeneratorPage from './pages/PDFGeneratorPage';
import QAView from './pages/QAView';
import DocstringPage from './pages/DocstringPage';
import ExecutionPage from './pages/ExecutionPage';
import VisualizerPage from './pages/VisualizerPage';
import SummaryPage from './pages/SummaryPage'; 

function App() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/embed" element={<EmbedderPage />} />
        <Route path="/pdf" element={<PDFGeneratorPage />} />
        <Route path="/qa" element={<QAView />} />
        <Route path="/docstring" element={<DocstringPage />} />
        <Route path="/executor" element={<ExecutionPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
        <Route path="/summary" element={<SummaryPage />} /> 
      </Routes>
    </Router>
    </div>
  );
}

export default App;
