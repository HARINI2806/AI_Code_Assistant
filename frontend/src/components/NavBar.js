// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-white shadow p-4 flex justify-between items-center">
    <div className="font-bold text-xl">AI Code Assistant</div>
    <div className="space-x-4">
      <Link to="/" className="hover:underline">Embed</Link>
      <Link to="/qa" className="hover:underline">QA</Link>
      <Link to="/pdf" className="hover:underline">PDF</Link>
      <Link to="/executor" className="hover:underline">Executor</Link>
      <Link to="/visualizer" className="hover:underline">Visualizer</Link>
      <Link to="/docstring" className="hover:underline">Docstring</Link>
      <Link to="/summary" className="hover:underline">Summary</Link>
    </div>
  </nav>
);

export default Navbar;
