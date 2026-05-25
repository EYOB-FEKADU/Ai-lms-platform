import React from 'react';

const CATEGORIES = [
  'All', 'Mathematics', 'Science', 'Language', 'Computer Science',
  'History', 'Geography', 'Arts', 'Music', 'Other',
];

const LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'primary', label: 'Primary School' },
  { value: 'middle_school', label: 'Middle School' },
  { value: 'highschool', label: 'High School' },
  { value: 'university', label: 'University' },
  { value: 'professional', label: 'Professional' },
];

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'om', label: 'Afaan Oromoo' },
];

export default function SearchFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Category */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value === 'All' ? '' : e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={filters.level}
            onChange={(e) => onFilterChange('level', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={filters.language}
            onChange={(e) => onFilterChange('language', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}