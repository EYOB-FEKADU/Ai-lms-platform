import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, getMyEnrolledCourses, enrollCourse } from '../../api';
import { getCurrentUser } from '../../api';
import ModuleList from '../../components/ModuleList';

export default function CourseDetail({ courseId: propCourseId, onBack, onStartLearning }) {
  const { id: paramId } = useParams();
  const id = propCourseId || paramId;
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    fetchCourse();
    if (user?.role === 'student') {
      checkEnrollment();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await getCourse(id);
      setCourse(data.course);
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const data = await getMyEnrolledCourses();
      const enrolled = data.enrollments.some(
        (e) => e.course?._id === id || e.course === id
      );
      setIsEnrolled(enrolled);
    } catch (err) {
      // Not critical
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollCourse(id);
      setIsEnrolled(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500 text-lg">{error || 'Course not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onBack ? onBack() : navigate('/courses')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline mb-6 flex items-center gap-1"
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-64 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-6xl flex-shrink-0">
              📐
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {course.level}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {course.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {course.description}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-sm font-bold">
                    {course.instructor?.fullName?.charAt(0) || '?'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {course.instructor?.fullName || 'Unknown'}
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {course.totalEnrollments || 0} students
                </span>
                <span className="text-yellow-500">⭐ {course.rating?.toFixed(1) || '0.0'}</span>
              </div>

              {/* Enroll / Action Buttons */}
              {user?.role === 'student' && (
                <div>
                  {isEnrolled ? (
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => onStartLearning ? onStartLearning() : navigate('/my-courses')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                      >
                        Go to My Courses →
                      </button>
                      <button
                        onClick={() => onStartLearning ? onStartLearning(null, id) : null}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                      >
                        🤖 Ask AI Tutor
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Course Content
          </h2>
          <ModuleList
            modules={course.modules || []}
            onLessonClick={(lesson) => navigate(`/learn/${lesson._id}`)}
          />
        </div>
      </div>
    </div>
  );
}