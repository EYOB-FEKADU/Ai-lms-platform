import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Profile from '../../components/Profile';
import { logoutUser, getLinkedChildren, linkChild, unlinkChild, getChildProgress } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ParentDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childProgress, setChildProgress] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'children') fetchChildren();
  }, [activeTab]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const data = await getLinkedChildren();
      setChildren(data.children || []);
    } catch (err) {
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    if (!linkEmail.trim()) return;
    try {
      await linkChild(linkEmail);
      setLinkEmail('');
      setShowLinkModal(false);
      fetchChildren();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to link child');
    }
  };

  const handleUnlinkChild = async (childId, childName) => {
    if (!confirm(`Unlink ${childName} from your account?`)) return;
    try {
      await unlinkChild(childId);
      fetchChildren();
    } catch (err) {
      alert('Failed to unlink child');
    }
  };

  const handleViewProgress = async (child) => {
    setSelectedChild(child);
    setActiveTab('progress');
    try {
      const data = await getChildProgress(child._id);
      setChildProgress(data.enrollments || []);
    } catch (err) {
      console.error('Failed to load progress');
    }
  };

  const handleLogout = () => { logoutUser(); onLogout(); };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'children', label: t('myChildren'), icon: '👨‍👩‍👧' },
    { id: 'profile', label: t('profile'), icon: '👤' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {t('welcomeBack')}, {user?.fullName?.split(' ')[0]}!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Monitor your children's learning progress</p>
                <button onClick={() => setActiveTab('children')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
                  My Children →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 text-center">
                <p className="text-3xl font-bold text-purple-600">{children.length}</p>
                <p className="text-sm text-gray-500 mt-1">Linked Children</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {childProgress.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active Enrollments</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 text-center">
                <p className="text-3xl font-bold text-indigo-600">
                  {childProgress.filter(e => e.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Completed</p>
              </div>
            </div>
          </div>
        );

      case 'children':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">👨‍👩‍👧 My Children</h2>
              <button onClick={() => setShowLinkModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                + Link Child
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : children.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-gray-500">No children linked yet</p>
                <p className="text-sm text-gray-400 mt-1">Link your children to monitor their learning progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {children.map(child => (
                  <div key={child._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xl font-bold text-purple-600">
                          {child.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{child.fullName}</h4>
                          <p className="text-sm text-gray-500">{child.email}</p>
                          <p className="text-xs text-purple-600">{child.profile?.grade || 'Grade not set'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleViewProgress(child)}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                          View Progress
                        </button>
                        <button onClick={() => handleUnlinkChild(child._id, child.fullName)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                          Unlink
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <button onClick={() => setActiveTab('children')}
              className="text-purple-600 hover:underline mb-4 flex items-center gap-1">
              ← Back to Children
            </button>
            <h2 className="text-xl font-semibold mb-6">
              📈 {selectedChild?.fullName}'s Progress
            </h2>
            {childProgress.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-4">
                {childProgress.map(enrollment => (
                  <div key={enrollment._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{enrollment.course?.title || 'Unknown Course'}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>{enrollment.status}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${enrollment.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <div><p className="text-sm font-semibold truncate">{user?.fullName?.split(' ')[0]}</p><p className="text-xs text-purple-600">Parent</p></div>
              )}
            </div>
          </div>
          <nav className="flex-1 py-4">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${activeTab === item.id ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${sidebarCollapsed ? 'justify-center' : ''}`}>
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
              <div className="mb-4 text-sm text-gray-500">
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-purple-600">🏠 Home</button>
                <span className="mx-2">/</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{menuItems.find(m => m.id === activeTab)?.label}</span>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Link a Child</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the email of your child's account. They must already have a student account.</p>
            <input type="email" value={linkEmail} onChange={e => setLinkEmail(e.target.value)}
              placeholder="child@example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mb-4" />
            <div className="flex gap-3">
              <button onClick={handleLinkChild}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Link</button>
              <button onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
