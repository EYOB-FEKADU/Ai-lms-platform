import React, { useState, useEffect } from 'react';
import { getMyCourses } from '../api';

export default function InstructorStudentList({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-gray-500 dark:text-gray-400">No courses created yet.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Create a course and students can enroll.
        </p>
      </div>
    );
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{courses.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalStudents}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {courses.filter(c => c.status === 'published').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Published Courses</p>
        </div>
      </div>

      {/* Course List with Student Count */}
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  course.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.totalEnrollments || 0} student{(course.totalEnrollments || 0) !== 1 ? 's' : ''} • {course.status}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">
                {expandedCourse === course._id ? '▾' : '▸'}
              </span>
            </button>

            {expandedCourse === course._id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
                {(course.totalEnrollments || 0) === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No students enrolled yet. Share this course to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📋 Student list will appear here. Backend endpoint for enrolled students coming soon.
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                        {course.totalEnrollments} enrolled
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        Course ID: {course._id?.slice(-6)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}