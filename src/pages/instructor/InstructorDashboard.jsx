// pages/InstructorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCourses, deleteCourse, updateCourseStatus } from '../api';

export default function InstructorDashboard({ user, onEditCourse, onCreateCourse }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const data = await getMyCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await updateCourseStatus(courseId, newStatus);
      fetchMyCourses();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your courses and students</p>
          </div>
          <button
onClick={() => onCreateCourse ? onCreateCourse() : navigate('/instructor/courses/new')}            className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
          >
            + New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Published</p>
            <p className="text-3xl font-bold text-green-600">
              {courses.filter((c) => c.status === 'published').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-indigo-600">
              {courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't created any courses yet</p>
            <button
              onClick={() => navigate('/instructor/courses/new')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Course
            </button>
          </div>
        )}

        {/* Course List */}
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : course.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {course.totalEnrollments || 0} students • {course.modules?.length || 0} modules
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  {course.status === 'draft' ? (
                    <button
                      onClick={() => handleStatusChange(course._id, 'published')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(course._id, 'draft')}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
onClick={() => onEditCourse ? onEditCourse(course._id) : navigate(`/instructor/courses/${course._id}/edit`)}                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}