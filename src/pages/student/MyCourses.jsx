import React, { useState, useEffect } from 'react';
import { getMyEnrolledCourses } from '../../api';

export default function MyCourses({ onCourseClick }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await getMyEnrolledCourses();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <p className="text-6xl mb-4">📚</p>
        <p className="text-gray-500 text-lg">You're not enrolled in any courses yet</p>
        <p className="text-gray-400 text-sm mt-1">Browse courses to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">My Enrolled Courses</h2>
      <div className="space-y-4">
        {enrollments.map((enrollment) => {
          const course = enrollment.course || {};
          return (
            <div
              key={enrollment._id}
              onClick={() => onCourseClick && onCourseClick(course._id)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  📐
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {course.title || 'Untitled Course'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.instructor?.fullName || 'Unknown Instructor'}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${enrollment.progress || 0}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-2xl">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
