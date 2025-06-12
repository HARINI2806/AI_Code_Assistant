// src/pages/HomePage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Embed Your Codebase',
    desc: 'Upload and parse your codebase for semantic understanding.',
    link: '/embed',
    color: 'bg-gradient-to-r from-blue-400 to-blue-600',
  },
  {
    title: 'Generate Summary PDF',
    desc: 'Auto-generate structured PDF summaries of your code.',
    link: '/pdf',
    color: 'bg-gradient-to-r from-purple-400 to-purple-600',
  },
  {
    title: 'Ask Questions',
    desc: 'Chat with your codebase using natural language.',
    link: '/qa',
    color: 'bg-gradient-to-r from-green-400 to-green-600',
  },
  {
    title: 'Visualize Codebase',
    desc: 'See architecture and flow with Mermaid diagrams.',
    link: '/visualizer',
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  },
  {
    title: 'Execute Functions',
    desc: 'Run specific functions inside your codebase from the UI.',
    link: '/execute',
    color: 'bg-gradient-to-r from-red-400 to-red-600',
  },
  {
    title: 'Generate Docstrings',
    desc: 'Preview and apply smart docstring suggestions.',
    link: '/docstring',
    color: 'bg-gradient-to-r from-pink-400 to-pink-600',
  },
];

const HomePage = () => {
  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <section className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-blue-600 dark:text-blue-400"
        >
          Welcome to Code Insight AI
        </motion.h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Your intelligent assistant for understanding and interacting with codebases.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-lg shadow-md text-white ${feat.color}`}
          >
            <h3 className="text-xl font-semibold">{feat.title}</h3>
            <p className="mt-2 text-sm">{feat.desc}</p>
            <Link
              to={feat.link}
              className="inline-block mt-4 px-3 py-1 bg-white text-sm text-gray-800 rounded hover:bg-gray-200"
            >
              Explore →
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
