// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

 useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    setIsDark(true);
    document.documentElement.classList.add('dark');
  }
}, []);

const toggleDarkMode = () => {
  const next = !isDark;
  setIsDark(next);
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', next ? 'dark' : 'light');
};

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);


  const links = [
    { to: '/', label: 'Home' },
    { to: '/embed', label: 'Embed' },
    { to: '/pdf', label: 'PDF' },
    { to: '/qa', label: 'QA' },
    { to: '/docstring', label: 'Docstrings' },
    { to: '/executor', label: 'Execute' },
    { to: '/visualizer', label: 'Visualize' },
    { to: '/summary', label: 'Impact Analysis' }
  ];

  return (
    <nav className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow">
      <h1 className="text-xl font-bold text-blue-600 dark:text-white">Code Insight AI</h1>
      <div className="flex gap-4 items-center">
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className="text-gray-700 dark:text-gray-200 hover:text-blue-500">
            {label}
          </Link>
        ))}
        <button
          onClick={toggleDarkMode}
          className="ml-4 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
        >
          {!isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;