import React, { useState, useEffect } from 'react';
import { getCourses } from '../../api';
import CourseCard from '../../components/CourseCard';
import SearchFilters from '../../components/SearchFilters';

export default function CourseCatalog({ onCourseClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', level: '', language: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { fetchCourses(); }, [filters, pagination.page]);

  const fetchCourses = async () => {
    setLoading(true); setError('');
    try {
      const data = await getCourses({ ...filters, page: pagination.page });
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load courses. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCourseClick = (courseId) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Catalog</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse all available courses on the platform</p>
      </div>

      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading && (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading courses...</p>
        </div>
      )}

      {error && !loading && <p className="text-red-500 text-center py-10">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📚</p>
          <p className="text-gray-500 text-lg">No courses found</p>
          <p className="text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} onClick={handleCourseClick} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Previous</button>
              <span className="text-gray-600">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
