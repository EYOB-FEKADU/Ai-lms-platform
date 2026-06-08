import React, { useState, useEffect, useRef } from 'react';
import { askAITutor, getChatHistory, saveChatMessage } from '../api';
import ModuleList from './ModuleList';

export default function CourseWithAI({ course, courseId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    loadHistory();
  }, [courseId]);

  const loadHistory = async () => {
    try {
      const data = await getChatHistory(courseId);
      if (data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([{
          role: 'assistant',
          content: `Hello! I'm your AI tutor for **${course?.title || 'this course'}**. Feel free to ask me anything about the course material!`
        }]);
      }
    } catch {
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your AI tutor for **${course?.title || 'this course'}**. Ask me anything!`
      }]);
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
        studentLevel: 'highschool',
        language: 'en',
        conversationHistory: history
      });

      const aiMsg = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMsg]);

      // Save to backend
      saveChatMessage(courseId, 'user', input).catch(() => {});
      saveChatMessage(courseId, 'assistant', data.response).catch(() => {});
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, AI tutor unavailable.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* LEFT: Course Content */}
      <div className="lg:w-1/2 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 flex items-center gap-1">
          ← Back
        </button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{course?.title}</h1>
        
        {activeLesson ? (
          <div>
            <button onClick={() => setActiveLesson(null)}
              className="text-indigo-600 hover:underline mb-4 flex items-center gap-1 text-sm">
              ← Back to Modules
            </button>
            <h2 className="text-lg font-semibold mb-2">{activeLesson.title}</h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {activeLesson.content || 'No content for this lesson.'}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Course Content</h2>
            <ModuleList
              modules={course?.modules || []}
              onLessonClick={(lesson) => setActiveLesson(lesson)}
            />
          </div>
        )}
      </div>

      {/* RIGHT: AI Chat */}
      <div className="lg:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Tutor</h3>
            <p className="text-xs text-gray-500">Ask about {course?.title}</p>
          </div>
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
              placeholder="Ask about this course..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
            />
            <button onClick={handleSend} disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
