import React, { useState } from 'react';

export default function LessonNavigation({ 
  currentIndex, 
  totalLessons, 
  onPrevious, 
  onNext, 
  isLastLesson,
  hasQuiz,
  onTakeQuiz,
  completedLessons
}) {
  const isFirst = currentIndex === 0;
  
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
          isFirst
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white'
        }`}
      >
        ← Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Lesson {currentIndex + 1} of {totalLessons}
        </span>
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${((currentIndex + 1) / totalLessons) * 100}%` }}
          />
        </div>
      </div>

      {isLastLesson && hasQuiz ? (
        <button
          onClick={onTakeQuiz}
          className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
        >
          📝 Take Module Quiz →
        </button>
      ) : (
        <button
          onClick={onNext}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
            completedLessons.includes(currentIndex)
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Next →
        </button>
      )}
    </div>
  );
}
