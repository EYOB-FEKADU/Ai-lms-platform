import React, { useState, useEffect } from 'react';
import { getLesson } from '../../api';

export default function MyLearning({ lessonId: propLessonId, onBack }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (propLessonId) fetchLesson();
  }, [propLessonId]);

  const fetchLesson = async () => {
    try {
      const data = await getLesson(propLessonId);
      setLesson(data.lesson);
    } catch (err) {
      console.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson) {
    return <p className="text-red-500 text-center py-10">Lesson not found</p>;
  }

  return (
    <div>
      <button onClick={onBack}
        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-1">
        ← Back to My Courses
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
            {lesson.contentType}
          </span>
          {lesson.duration > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{lesson.duration} min</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{lesson.title}</h1>

        {lesson.contentType === 'video' && lesson.videoUrl && (
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
            <p className="text-gray-400">▶ Video: {lesson.videoUrl}</p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-8">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
            {lesson.content || 'No content available for this lesson.'}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {completed ? '✅ Lesson Completed!' : 'Finish this lesson'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completed ? 'Great job! Move on to the next lesson.' : "Mark as complete when you're ready."}
            </p>
          </div>
          <button onClick={() => setCompleted(!completed)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              completed
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            {completed ? 'Completed ✓' : 'Mark as Complete'}
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🤖 Ask the AI Tutor</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Ask a question about this lesson..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Ask</button>
          </div>
        </div>
      </div>
    </div>
  );
}
