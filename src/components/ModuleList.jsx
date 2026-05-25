// components/ModuleList.jsx
import React, { useState } from 'react';
import LessonItem from './LessonItem';

export default function ModuleList({ modules, onLessonClick, showEdit, onEditModule }) {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <p className="text-4xl mb-3">📚</p>
        <p>No modules yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module, index) => (
        <div
          key={module._id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Module Header */}
          <button
            onClick={() => toggleModule(module._id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {index + 1}
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {module.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {module.lessons?.length || 0} lessons
                </p>
              </div>
            </div>
            <span className="text-gray-400 text-xl">
              {expandedModules[module._id] ? '▾' : '▸'}
            </span>
          </button>

          {/* Lessons */}
          {expandedModules[module._id] && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              {module.lessons?.map((lesson, idx) => (
                <LessonItem
                  key={lesson._id}
                  lesson={lesson}
                  index={idx}
                  onClick={() => onLessonClick && onLessonClick(lesson)}
                  showEdit={showEdit}
                />
              ))}
              {(!module.lessons || module.lessons.length === 0) && (
                <p className="p-4 text-sm text-gray-400">No lessons in this module</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}