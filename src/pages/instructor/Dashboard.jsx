// pages/instructor/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Profile from '../../components/Profile';
import InstructorStudentList from '../../components/InstructorStudentList';
import CourseCatalog from '../shared/CourseCatalog';
import CourseDetail from '../shared/CourseDetail';
import CourseBuilder from './CourseBuilder';
import { logoutUser, getMyCourses, deleteCourse, updateCourseStatus } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function InstructorDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'my-courses') {
      fetchMyCourses();
    }
  }, [activeTab]);

  const fetchMyCourses = async () => {
    try {
      const data = await getMyCourses();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleDelete = async (courseId, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteCourse(courseId);
    fetchMyCourses();
  };

  const handleStatusChange = async (courseId, newStatus) => {
    await updateCourseStatus(courseId, newStatus);
    fetchMyCourses();
  };

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'my-courses', label: t('myCourses'), icon: '📖' },
    { id: 'create-course', label: t('createCourse'), icon: '✏️' },
    { id: 'students', label: t('students'), icon: '👨‍🎓' },
    { id: 'courses', label: t('browseCatalog'), icon: '🔍' },
    { id: 'profile', label: t('profile'), icon: '👤' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👩‍🏫</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {t('welcomeBack')}, {user?.fullName?.split(' ')[0]}!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('manageCourses')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <button onClick={() => setActiveTab('create-course')}
                    className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                    <span className="text-2xl">✏️</span>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mt-1">{t('createCourse')}</p>
                  </button>
                  <button onClick={() => setActiveTab('my-courses')}
                    className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition">
                    <span className="text-2xl">📖</span>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mt-1">{t('myCourses')}</p>
                  </button>
                  <button onClick={() => setActiveTab('students')}
                    className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition">
                    <span className="text-2xl">👨‍🎓</span>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-1">{t('students')}</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('totalCourses')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('published')}</p>
                <p className="text-3xl font-bold text-green-600">{courses.filter(c => c.status === 'published').length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('totalStudents')}</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        );

      case 'my-courses':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('myCourses')}</h2>
              <button onClick={() => setActiveTab('create-course')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                + {t('newCourse')}
              </button>
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-gray-500 dark:text-gray-400">{t('noCoursesYet')}</p>
                <button onClick={() => setActiveTab('create-course')}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {t('createFirstCourse')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.totalEnrollments || 0} {t('students_enrolled')} • {course.modules?.length || 0} {t('modulesAndLessons').split(' ')[0].toLowerCase()}</p>
                    </div>
                    <div className="flex gap-2">
                      {course.status === 'draft' ? (
                        <button onClick={() => handleStatusChange(course._id, 'published')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">{t('publish')}</button>
                      ) : (
                        <button onClick={() => handleStatusChange(course._id, 'draft')}
                          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">{t('unpublish')}</button>
                      )}
                      <button onClick={() => { setSelectedCourseId(course._id); setActiveTab('edit-course'); }}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">{t('edit')}</button>
                      <button onClick={() => handleDelete(course._id, course.title)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">{t('delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'create-course':
        return <CourseBuilder onSave={() => { fetchMyCourses(); setActiveTab('my-courses'); }} onCancel={() => setActiveTab('my-courses')} />;

      case 'edit-course':
        return <CourseBuilder courseId={selectedCourseId} onSave={() => { fetchMyCourses(); setActiveTab('my-courses'); }} onCancel={() => setActiveTab('my-courses')} />;

      case 'students':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">👨‍🎓 {t('students')}</h2>
            <InstructorStudentList user={user} />
          </div>
        );

      case 'courses':
        return <CourseCatalog onCourseClick={(id) => { setSelectedCourseId(id); setActiveTab('course-detail'); }} />;

      case 'course-detail':
        return <CourseDetail courseId={selectedCourseId} onBack={() => setActiveTab('courses')} />;

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
        {/* Sidebar */}
        <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-xl z-20 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'I'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.fullName?.split(' ')[0]}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{t('role')}: Instructor</p>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  activeTab === item.id ? 'bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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

        {/* Main Content */}
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-6">
            {activeTab !== 'dashboard' && (
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-green-600 dark:hover:text-green-400">
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