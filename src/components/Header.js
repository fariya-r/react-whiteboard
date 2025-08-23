// src/components/Header.js (Updated)

import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
const logo = process.env.PUBLIC_URL + '/assets/logo.png';

const Header = ({ userProfile, handleLogout, onProfileClick, title }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 text-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 md:mb-8 border border-slate-700 gap-4">
      
      {/* Logo and Welcome */}
      <div className="flex items-center space-x-3 sm:space-x-4 w-full md:w-auto">
        <img src={logo} alt="E-Board Logo" className="h-10 sm:h-12 w-auto" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            {title || (userProfile?.role === 'Admin' ? 'Admin Dashboard' : 'Teacher Dashboard')}
          </h1>
          {userProfile && (
            <p className="mt-1 text-slate-400 text-sm sm:text-base">
              Welcome back,{" "}
              <span className="font-semibold text-indigo-400">
                {userProfile?.name || 'Loading...'}
              </span>{" "}
              👋
            </p>
          )}
        </div>
      </div>
  
      {/* User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4 self-end md:self-auto">
        {userProfile && (
          <button
            onClick={onProfileClick}
            className="text-indigo-400 hover:text-indigo-300 text-3xl sm:text-4xl p-1 sm:p-2 rounded-full transition-all hover:bg-slate-700"
            title="View Profile"
          >
            <FaUserCircle />
          </button>
        )}
        <button
          onClick={handleLogout}
          className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all flex items-center space-x-2 text-sm sm:text-base"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
  
};

export default Header;