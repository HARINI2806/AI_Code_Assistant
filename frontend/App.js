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
import SummaryPage from './pages/SummaryPage'; // 🆕

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/embed" element={<EmbedderPage />} />
        <Route path="/pdf" element={<PDFGeneratorPage />} />
        <Route path="/qa" element={<QAView />} />
        <Route path="/docstring" element={<DocstringPage />} />
        <Route path="/execute" element={<ExecutionPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
        <Route path="/summary" element={<SummaryPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
