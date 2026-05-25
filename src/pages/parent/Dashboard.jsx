// pages/parent/Dashboard.jsx
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Profile from '../../components/Profile';
import { logoutUser } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ParentDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'children', label: t('myChildren'), icon: '👨‍👩‍👧' },
    { id: 'progress', label: t('progress'), icon: '📈' },
    { id: 'profile', label: t('profile'), icon: '👤' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍👩‍👧</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {t('welcomeBack')}, {user?.fullName?.split(' ')[0]}!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{t('monitorChildren')}</p>
              <button onClick={() => setActiveTab('children')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t('myChildren')} →
              </button>
            </div>
          </div>
        );

      case 'children':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">👨‍👩‍👧 {t('myChildren')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('comingSoon')}</p>
          </div>
        );

      case 'progress':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">📈 {t('progress')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('comingSoon')}</p>
          </div>
        );

      case 'profile':
        return <Profile user={user} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar user={user} sidebarCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex">
        <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-xl z-20 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'P'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.fullName?.split(' ')[0]}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">{t('role')}: Parent</p>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  activeTab === item.id ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}>
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <span>🚪</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">{t('logout')}</span>}
            </button>
          </div>
        </aside>

        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-6">
            {activeTab !== 'dashboard' && (
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-purple-600 dark:hover:text-purple-400">
                  🏠 {t('home')}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {menuItems.find(m => m.id === activeTab)?.label || activeTab}
                </span>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}