import React, { useState, useEffect, useRef } from 'react';
import { askAITutor, getChatHistory, saveChatMessage, getCourse, markLessonComplete, getQuizByModule, getCourseProgress } from '../api';
import ModuleList from './ModuleList';
import LessonNavigation from './LessonNavigation';
import QuizComponent from './QuizComponent';
import QuizLessonParser from './QuizLessonParser';

export default function CourseWithAI({ courseId, onBack }) {
  const [courseData, setCourseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      loadHistory();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const data = await getCourse(courseId);
      setCourseData(data.course);

      // Load student progress
      try {
        const progressData = await getCourseProgress(courseId);
        const completedIds = progressData.progress
          ?.filter(p => p.status === 'completed')
          ?.map(p => p.lesson) || [];
        setCompletedLessons(completedIds);

        // Find last completed lesson and jump to next
        const allLessons = data.course?.modules?.flatMap(m => m.lessons || []) || [];
        if (completedIds.length > 0 && completedIds.length < allLessons.length) {
          const nextLesson = allLessons[completedIds.length];
          if (nextLesson) {
            setActiveLesson(nextLesson);
            setLessonIndex(completedIds.length);
            return;
          }
        }
      } catch {}

      if (data.course?.modules?.length > 0 && data.course.modules[0]?.lessons?.length > 0) {
        setActiveLesson(data.course.modules[0].lessons[0]);
        setLessonIndex(0);
      }
    } catch (err) {
      console.error('Failed to load course:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getChatHistory(courseId);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([{ role: 'assistant', content: "Hello! I'm your AI tutor for this course. Ask me anything!" }]);
      }
    } catch {
      setMessages([{ role: 'assistant', content: "Hello! I'm your AI tutor. Ask me anything!" }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const data = await askAITutor({
        question: input,
        courseId,
        lessonId: activeLesson?._id,
        studentLevel: 'highschool',
        language: 'en',
        conversationHistory: history
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setTimeout(() => saveChatMessage(courseId, 'user', input).catch(() => {}), 0);
      setTimeout(() => saveChatMessage(courseId, 'assistant', data.response).catch(() => {}), 0);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI tutor unavailable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = async () => {
    // BLOCK NEXT if current lesson is a quiz and not passed
    if (activeLesson?.contentType === 'quiz' && !quizPassed) {
      alert('You must pass the quiz before proceeding to the next lesson.');
      return;
    }

    if (activeLesson?._id) {
      console.log('Marking complete:', activeLesson._id, 'Type:', activeLesson.contentType);
      await markLessonComplete(activeLesson._id).catch((e) => console.log('Mark error:', e));
      setCompletedLessons(prev => [...prev, activeLesson._id]);
    }

    const currentModule = courseData?.modules?.find(m =>
      m.lessons?.some(l => l._id === activeLesson?._id)
    );

    if (currentModule) {
      const lessonIds = currentModule.lessons.map(l => l._id);
      const currentIdx = lessonIds.indexOf(activeLesson._id);

      if (currentIdx === lessonIds.length - 1) {
        try {
          const data = await getQuizByModule(currentModule._id);
          if (data.quiz) {
            setShowQuiz(true);
          } else {
            alert('Module complete! No quiz for this module.');
          }
        } catch {
          alert('Module complete!');
        }
        return;
      }

      setActiveLesson(currentModule.lessons[currentIdx + 1]);
      setLessonIndex(currentIdx + 1);
    }
  };

  const handlePreviousLesson = () => {
    const currentModule = courseData?.modules?.find(m =>
      m.lessons?.some(l => l._id === activeLesson?._id)
    );
    if (currentModule) {
      const lessonIds = currentModule.lessons.map(l => l._id);
      const currentIdx = lessonIds.indexOf(activeLesson._id);
      if (currentIdx > 0) {
        setActiveLesson(currentModule.lessons[currentIdx - 1]);
        setLessonIndex(currentIdx - 1);
      }
    }
  };

  const totalLessons = courseData?.modules?.flatMap(m => m.lessons || []).length || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* LEFT: Course Content */}
      <div className={`overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all ${aiPanelCollapsed ? 'lg:w-full' : 'lg:flex-1'}`}>
        <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 flex items-center gap-1">
          ← Back to Course
        </button>

        {showQuiz ? (
          <QuizComponent
            moduleId={courseData?.modules?.find(m => m.lessons?.some(l => l._id === activeLesson?._id))?._id}
            onComplete={(result) => {
              setShowQuiz(false);
              alert('Module completed! Next module unlocked.');
            }}
            onBack={() => setShowQuiz(false)}
          />
        ) : activeLesson ? (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activeLesson.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
              {activeLesson.contentType} {activeLesson.duration > 0 && `• ${activeLesson.duration} min`}
            </p>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {activeLesson.contentType === 'quiz' ? <QuizLessonParser content={activeLesson.content} onPass={() => setQuizPassed(true)} /> : (activeLesson.content || 'No content for this lesson.')}
            </div>
            <LessonNavigation
              currentIndex={lessonIndex}
              totalLessons={totalLessons}
              onPrevious={handlePreviousLesson}
              onNext={handleNextLesson}
              completedLessons={completedLessons}
            />
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold mb-4">{courseData?.title}</h1>
            <ModuleList
              modules={courseData?.modules || []}
              onLessonClick={(lesson) => {
                setActiveLesson(lesson);
                setLessonIndex(0);
              }}
            />
          </div>
        )}
      </div>

      {/* RIGHT: AI Chat */}
      {!aiPanelCollapsed && (
        <div className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-semibold text-sm">AI Tutor</h3>
                <p className="text-xs text-gray-500">Lesson: {activeLesson?.title?.slice(0, 30) || 'General'}...</p>
              </div>
            </div>
            <button onClick={() => setAiPanelCollapsed(true)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ask about this lesson..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
              />
              <button onClick={handleSend} disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed AI Button */}
      {aiPanelCollapsed && (
        <button
          onClick={() => setAiPanelCollapsed(false)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 text-2xl"
        >
          🤖
        </button>
      )}
    </div>
  );
}
