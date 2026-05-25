// components/LessonItem.jsx
import React from 'react';

const CONTENT_ICONS = {
  text: '📄',
  video: '🎥',
  quiz: '✏️',
  assignment: '📝',
};

export default function LessonItem({ lesson, index, onClick, showEdit, completed }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 pl-6 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 last:border-b-0"
    >
      {/* Completion Checkbox */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {completed && <span className="text-white text-xs">✓</span>}
      </div>

      {/* Content Type Icon */}
      <span className="text-lg flex-shrink-0">
        {CONTENT_ICONS[lesson.contentType] || '📄'}
      </span>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.contentType}
          </span>
          {lesson.duration > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {lesson.duration} min
              </span>
            </>
          )}
        </div>
      </div>

      {/* Edit Button (for instructor) */}
      {showEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Edit logic here
          }}
          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ✏️
        </button>
      )}

      {/* Arrow */}
      <span className="text-gray-300 dark:text-gray-600">→</span>
    </div>
  );
}