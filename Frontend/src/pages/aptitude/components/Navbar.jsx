import React from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="h-16 bg-black/95 backdrop-blur-md border-b border-neutral-900 flex justify-between items-center px-4 md:px-8 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { console.log("Navbar Button Clicked"); onMenuClick(); }}
          className="p-2 md:hidden rounded-xl bg-white/5 text-neutral-300 hover:bg-white/10 transition-all"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <span className="text-xl font-bold tracking-tight text-white">
          Zen<span className="text-orange-500">Code</span> Hub
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/aptitude" className="text-neutral-300 hover:text-orange-500 font-bold text-sm uppercase tracking-tighter transition-colors">Home</Link>
      </div>
    </nav>
  );
};

export default Navbar;