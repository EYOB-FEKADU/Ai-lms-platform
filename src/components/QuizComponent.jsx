import React, { useState, useEffect } from 'react';
import { getQuizByModule, submitQuiz } from '../api';

export default function QuizComponent({ moduleId, onComplete, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  const fetchQuiz = async () => {
    try {
      const data = await getQuizByModule(moduleId);
      setQuiz(data.quiz);
    } catch (err) {
      console.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));
      const data = await submitQuiz(quiz._id, answersArray);
      setResult(data);
      if (data.passed) onComplete(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No quiz available for this module yet.</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">
            ← Back to Lessons
          </button>
        )}
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">{result.passed ? '🎉' : '📚'}</div>
        <h2 className="text-2xl font-bold mb-2">
          {result.passed ? 'Quiz Passed!' : 'Not Quite There Yet'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Score: <span className="font-bold">{result.score}%</span>
          (Passing: {quiz.passingScore}%)
        </p>
        <p className="text-sm text-gray-500 mb-2">Attempt #{result.attemptNumber}</p>

        {result.weakAreas?.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Areas to improve:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.weakAreas.map((area, i) => (
                <span key={i} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {!result.passed && (
            <button
              onClick={() => { setResult(null); setCurrentQuestion(0); setAnswers({}); }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry Quiz
            </button>
          )}
          {result.passed && onComplete && (
            <button
              onClick={() => onComplete(result)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz view
  const question = quiz.questions[currentQuestion];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-indigo-600 hover:underline text-sm">
          ← Exit Quiz
        </button>
        <h2 className="text-lg font-semibold">{quiz.title}</h2>
        <span className="text-sm text-gray-500">
          Q{currentQuestion + 1}/{quiz.questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
        <div
          className="h-full bg-purple-600 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-4">{question.question}</h3>

        {question.type === 'multiple_choice' && (
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  answers[question._id] === option
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name={`question_${question._id}`}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={() => handleAnswer(question._id, option)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="flex gap-4">
            {['true', 'false'].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswer(question._id, val)}
                className={`px-6 py-3 rounded-lg border transition ${
                  answers[question._id] === val
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {val === 'true' ? '✓ True' : '✗ False'}
              </button>
            ))}
          </div>
        )}

        {question.type === 'fill_blank' && (
          <input
            type="text"
            value={answers[question._id] || ''}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        )}

        {question.type === 'short_answer' && (
          <textarea
            value={answers[question._id] || ''}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            rows={4}
            placeholder="Write your answer..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          ← Previous
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!answers[question._id]}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !answers[question._id]}
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
