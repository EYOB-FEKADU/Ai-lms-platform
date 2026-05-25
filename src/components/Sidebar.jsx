import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'courses', label: 'Browse Courses', icon: '🔍' },
      { id: 'my-courses', label: 'My Learning', icon: '📚' },
      { id: 'ai-tutor', label: 'AI Tutor', icon: '🤖' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
    instructor: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'my-courses', label: 'My Courses', icon: '📖' },
      { id: 'create-course', label: 'Create Course', icon: '✏️' },
      { id: 'students', label: 'Students', icon: '👨‍🎓' },
      { id: 'courses', label: 'Browse Catalog', icon: '🔍' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
    parent: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'children', label: 'My Children', icon: '👨‍👩‍👧' },
      { id: 'courses', label: 'Browse Courses', icon: '🔍' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
    super_admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'users', label: 'Users', icon: '👥' },
      { id: 'institutions', label: 'Institutions', icon: '🏢' },
      { id: 'courses', label: 'All Courses', icon: '📚' },
      { id: 'analytics', label: 'Analytics', icon: '📉' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
    institution_admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'users', label: 'Manage Users', icon: '👥' },
      { id: 'courses', label: 'Courses', icon: '📚' },
      { id: 'analytics', label: 'Analytics', icon: '📉' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
  };

  const items = menuItems[user?.role] || menuItems.student;

  const getRoleBadgeColor = () => {
    const colors = {
      student: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      instructor: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      parent: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      super_admin: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      institution_admin: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    };
    return colors[user?.role] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-30
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <span className="text-2xl">🎓</span>
            {!isCollapsed && (
              <span className="font-bold text-gray-800 dark:text-white text-lg">LMS Portal</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'}
              />
            </svg>
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {user?.fullName?.split(' ')[0] || 'User'}
                </p>
                <p className={`text-xs ${getRoleBadgeColor()} px-2 py-0.5 rounded-full inline-block mt-1`}>
                  {user?.role === 'super_admin' ? 'Admin' : user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      activeTab === item.id
                        ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  {activeTab === item.id && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-6 bg-purple-600 dark:bg-purple-400 rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;