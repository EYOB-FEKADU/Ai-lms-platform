import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Profile from '../../components/Profile';
import { logoutUser, getAllUsers, updateUser, deleteUser, resetUserPassword, linkParentToStudent, getParentLinks } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [parentLinks, setParentLinks] = useState([]);
const [linkForm, setLinkForm] = useState({ parentEmail: '', studentEmail: '' });
const [linkMessage, setLinkMessage] = useState('');

 useEffect(() => {
  if (activeTab === 'users') fetchUsers();
  if (activeTab === 'parents') fetchParentLinks();
}, [activeTab, filterRole]);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers({ role: filterRole, search: searchTerm });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Failed to change role');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user');
    }
  };
const fetchParentLinks = async () => {
  try {
    const data = await getParentLinks();
    setParentLinks(data.parents || []);
  } catch (err) {
    console.error('Failed to fetch parent links');
  }
};

const handleLinkParent = async () => {
  setLinkMessage('');
  try {
    await linkParentToStudent(linkForm.parentEmail, linkForm.studentEmail);
    setLinkMessage('Parent linked successfully!');
    setLinkForm({ parentEmail: '', studentEmail: '' });
    fetchParentLinks();
  } catch (err) {
    setLinkMessage(err.response?.data?.error || 'Failed to link');
  }
};
  const handleResetPassword = async (userId, userName) => {
    const newPassword = prompt('Enter new password for ' + userName + ' (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await resetUserPassword(userId, newPassword);
      alert('Password reset successfully for ' + userName);
    } catch (err) {
      console.error('Failed to reset password');
      alert('Failed to reset password');
    }
  };
  const handleLogout = () => { logoutUser(); onLogout(); };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'users', label: t('users'), icon: '👥' },
    { id: 'parents', label: 'Parent Links', icon: '🔗' },
    { id: 'institutions', label: t('institutions'), icon: '🏢' },
    { id: 'analytics', label: t('analytics'), icon: '📉' },
    { id: 'profile', label: t('profile'), icon: '👤' },
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    students: users.filter(u => u.role === 'student').length,
    instructors: users.filter(u => u.role === 'instructor').length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.total, color: 'indigo' },
                  { label: 'Active', value: stats.active, color: 'green' },
                  { label: 'Students', value: stats.students, color: 'blue' },
                  { label: 'Instructors', value: stats.instructors, color: 'purple' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('users')}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition text-center">
                <span className="text-4xl">👥</span>
                <p className="font-semibold mt-2">Manage Users</p>
              </button>
              <button onClick={() => setActiveTab('analytics')}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition text-center">
                <span className="text-4xl">📉</span>
                <p className="font-semibold mt-2">View Analytics</p>
              </button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-semibold">👥 User Management</h2>
              <div className="flex gap-2">
                <input type="text" placeholder="Search users..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm" />
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm">
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="parent">Parent</option>
                  <option value="super_admin">Admin</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Role</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Joined</th>
                      <th className="text-right py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {u.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{u.fullName}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <select value={u.role} onChange={e => handleChangeRole(u._id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-xs">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="parent">Parent</option>
                            <option value="super_admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                                              <td className="py-3 px-2 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleResetPassword(u._id, u.fullName)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs">Reset PW</button>
                            <button onClick={() => handleDelete(u._id, u.fullName)}
                              className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No users found</p>
                )}
              </div>
            )}
          </div>
        );
case 'parents':
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">🔗 Parent-Student Links</h2>
      
      {/* Link Form */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <h3 className="font-medium mb-3">Link Parent to Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="email" placeholder="Parent email" value={linkForm.parentEmail}
            onChange={e => setLinkForm({ ...linkForm, parentEmail: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-sm" />
          <input type="email" placeholder="Student email" value={linkForm.studentEmail}
            onChange={e => setLinkForm({ ...linkForm, studentEmail: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-sm" />
          <button onClick={handleLinkParent}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            Link
          </button>
        </div>
        {linkMessage && (
          <p className={`text-sm mt-2 ${linkMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {linkMessage}
          </p>
        )}
      </div>

      {/* Existing Links */}
      <h3 className="font-medium mb-3">Existing Links</h3>
      {parentLinks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No parent-student links yet.</p>
      ) : (
        <div className="space-y-3">
          {parentLinks.map(parent => (
            <div key={parent._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm">👨‍👩‍👧</div>
                <div>
                  <p className="font-medium text-sm">{parent.fullName}</p>
                  <p className="text-xs text-gray-500">{parent.email}</p>
                </div>
              </div>
              <div className="ml-11 space-y-1">
                {parent.profile?.linkedChildren?.length > 0 ? (
                  parent.profile.linkedChildren.map(child => (
                    <div key={child._id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>👤</span>
                      <span>{child.fullName}</span>
                      <span className="text-xs text-gray-400">({child.email})</span>
                      <span className="text-xs text-purple-500">{child.profile?.grade || ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No children linked</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
      case 'institutions':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🏢 Institutions</h2>
            <p className="text-gray-500">Institution management coming soon.</p>
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📉 Analytics</h2>
            <p className="text-gray-500">Analytics dashboard coming soon.</p>
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="text-sm font-semibold truncate">{user?.fullName?.split(' ')[0]}</p>
                  <p className="text-xs text-red-600">Admin</p>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 py-4">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  activeTab === item.id ? 'bg-red-50 dark:bg-red-900/50 text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}>
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
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-red-600">🏠 Home</button>
                <span className="mx-2">/</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{menuItems.find(m => m.id === activeTab)?.label}</span>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
