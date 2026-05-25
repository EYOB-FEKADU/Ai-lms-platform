// pages/instructor/CourseBuilder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourse, createCourse, updateCourse,
  createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
} from '../../api';

export default function CourseBuilder({ courseId: propCourseId, onSave, onCancel }) {
  const { courseId: paramCourseId } = useParams();
  const courseId = propCourseId || paramCourseId;
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const [course, setCourse] = useState({
    title: '', description: '', category: 'Mathematics',
    level: 'highschool', language: 'en',
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Lesson editor state
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '', contentType: 'text', content: '',
    videoUrl: '', duration: 0, aiPromptContext: '',
  });

  useEffect(() => {
    if (isEditing) fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const data = await getCourse(courseId);
      const c = data.course;
      setCourse({
        title: c.title, description: c.description,
        category: c.category, level: c.level, language: c.language,
      });
      setModules(c.modules || []);
    } catch (err) {
      setMessage('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setSaving(true); setMessage('');
    try {
      if (isEditing) {
        await updateCourse(courseId, course);
        setMessage('Course updated!');
      } else {
        const data = await createCourse(course);
        setMessage('Course created!');
        if (onSave) onSave(data.course._id);
        else navigate(`/instructor/courses/${data.course._id}/edit`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async () => {
    const title = prompt('Module title:');
    if (!title) return;
    try {
      const data = await createModule(courseId, { title });
      setModules([...modules, data.module]);
      setMessage('Module added!');
    } catch (err) {
      setMessage('Failed to add module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await deleteModule(moduleId);
      setModules(modules.filter(m => m._id !== moduleId));
      setMessage('Module deleted');
    } catch (err) {
      setMessage('Failed to delete module');
    }
  };

  // Open lesson editor (for new or existing lesson)
  const openLessonEditor = (moduleId, lesson = null) => {
    if (lesson) {
      setLessonForm({
        title: lesson.title || '',
        contentType: lesson.contentType || 'text',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0,
        aiPromptContext: lesson.aiPromptContext || '',
      });
      setEditingLesson({ ...lesson, moduleId });
    } else {
      setLessonForm({
        title: '', contentType: 'text', content: '',
        videoUrl: '', duration: 0, aiPromptContext: '',
      });
      setEditingLesson({ moduleId, _id: null });
    }
  };

  // Save lesson (create or update)
  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      setMessage('Lesson title is required');
      return;
    }
    try {
      if (editingLesson._id) {
        await updateLesson(editingLesson._id, lessonForm);
        setMessage('Lesson updated!');
      } else {
        await createLesson(editingLesson.moduleId, lessonForm);
        setMessage('Lesson added!');
      }
      setEditingLesson(null);
      fetchCourseData(); // Refresh
    } catch (err) {
      setMessage('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      setMessage('Lesson deleted');
      fetchCourseData();
    } catch (err) {
      setMessage('Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onCancel ? onCancel() : navigate('/instructor')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('Failed') || message.includes('failed')
          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
          {message}
        </div>
      )}

      {/* Course Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={course.title}
              onChange={e => setCourse({ ...course, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={course.description} rows={3}
              onChange={e => setCourse({ ...course, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={course.category} onChange={e => setCourse({ ...course, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              {['Mathematics', 'Science', 'Language', 'Computer Science', 'History', 'Geography', 'Arts', 'Music', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select value={course.level} onChange={e => setCourse({ ...course, level: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="primary">Primary School</option>
              <option value="middle_school">Middle School</option>
              <option value="highschool">High School</option>
              <option value="university">University</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select value={course.language} onChange={e => setCourse({ ...course, language: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Afaan Oromoo</option>
            </select>
          </div>
        </div>
        <button onClick={handleSaveCourse} disabled={saving}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
        </button>
      </div>

      {/* Modules & Lessons */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Modules & Lessons</h2>
            <button onClick={handleAddModule}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              + Add Module
            </button>
          </div>

          {modules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No modules yet. Add your first module to start building your course.
            </p>
          ) : (
            <div className="space-y-4">
              {modules.map((module, idx) => (
                <div key={module._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Module {idx + 1}: {module.title}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => openLessonEditor(module._id)}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        + Add Lesson
                      </button>
                      <button onClick={() => handleDeleteModule(module._id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {module.lessons && module.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lIdx) => (
                        <div key={lesson._id}
                          className="flex items-center justify-between pl-4 py-2 bg-gray-50 dark:bg-gray-750 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {lesson.contentType === 'video' ? '🎥' : lesson.contentType === 'quiz' ? '✏️' : '📄'}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {idx + 1}.{lIdx + 1}: {lesson.title}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({lesson.contentType}{lesson.duration > 0 ? `, ${lesson.duration}min` : ''})
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openLessonEditor(module._id, lesson)}
                              className="text-xs text-indigo-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteLesson(lesson._id)}
                              className="text-xs text-red-600 hover:underline">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 pl-4">No lessons in this module</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingLesson._id ? 'Edit Lesson' : 'Add Lesson'}
                </h3>
                <button onClick={() => setEditingLesson(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lesson Title</label>
                  <input type="text" value={lessonForm.title}
                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Introduction to Variables" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Content Type</label>
                    <select value={lessonForm.contentType}
                      onChange={e => setLessonForm({ ...lessonForm, contentType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="text">Text</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input type="number" value={lessonForm.duration}
                      onChange={e => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                {lessonForm.contentType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Video URL</label>
                    <input type="text" value={lessonForm.videoUrl}
                      onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://www.youtube.com/watch?v=..." />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content {lessonForm.contentType === 'text' ? '(supports plain text and basic formatting)' : ''}
                  </label>
                  <textarea value={lessonForm.content} rows={8}
                    onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder={lessonForm.contentType === 'text' 
                      ? 'Write your lesson content here...\n\nYou can use multiple lines and paragraphs.'
                      : lessonForm.contentType === 'quiz'
                      ? 'Enter quiz questions and answers here...'
                      : 'Enter assignment instructions here...'} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    AI Tutor Context (helps the AI understand this lesson)
                  </label>
                  <textarea value={lessonForm.aiPromptContext} rows={3}
                    onChange={e => setLessonForm({ ...lessonForm, aiPromptContext: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Key concepts: variables, constants, expressions&#10;Common misconceptions: confusing variable with unknown" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveLesson}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editingLesson._id ? 'Update Lesson' : 'Add Lesson'}
                </button>
                <button onClick={() => setEditingLesson(null)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}