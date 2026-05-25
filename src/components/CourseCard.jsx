import React from 'react';

const CATEGORY_ICONS = {
  'Mathematics': '📐',
  'Science': '🔬',
  'Language': '📝',
  'Computer Science': '💻',
  'History': '📜',
  'Geography': '🌍',
  'Arts': '🎨',
  'Music': '🎵',
  'Other': '📚',
};

const LEVEL_LABELS = {
  'primary': 'Primary School',
  'middle_school': 'Middle School',
  'highschool': 'High School',
  'university': 'University',
  'professional': 'Professional',
};

export default function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={() => onClick(course._id)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500"
    >
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          CATEGORY_ICONS[course.category] || '📚'
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
            {LEVEL_LABELS[course.level] || course.level}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {course.language === 'am' ? 'አማርኛ' : course.language === 'om' ? 'Afaan Oromoo' : 'English'}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {course.instructor?.fullName?.charAt(0) || '?'}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {course.instructor?.fullName || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-yellow-500">
            <span>⭐</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {course.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {course.totalEnrollments || 0} students
          </span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
        </div>
      </div>
    </div>
  );
}