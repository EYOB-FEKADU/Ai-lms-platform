import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../i18n';

const Navbar = ({ user, sidebarCollapsed, toggleSidebar }) => {
  const { language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getRoleBadge = () => {
    const badges = {
      student: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      instructor: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      parent: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      super_admin: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      institution_admin: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    };
    return badges[user?.role] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20 transition-colors duration-200">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Sidebar Toggle + Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="font-bold text-gray-800 dark:text-white text-lg hidden sm:block">
                LMS Platform
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1"
                title="Change Language"
              >
                <span className="text-lg">
                  {languages.find(l => l.code === language)?.flag || '🌐'}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block uppercase font-medium">
                  {language}
                </span>
              </button>

              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                          language === lang.code
                            ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="relative">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                
                {/* User Info */}
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge()}`}>
                    {user?.role === 'super_admin' ? 'Admin' : user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;