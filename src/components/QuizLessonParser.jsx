import React, { useState, useEffect } from 'react';

export default function QuizLessonParser({ content, onPass, onFail }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);

  // Parse and shuffle quiz on mount and retry
  const parseQuiz = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const parsed = [];
    let currentQ = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^Q\d+\./.test(trimmed)) {
        if (currentQ) parsed.push(currentQ);
        currentQ = {
          question: trimmed.replace(/^Q\d+\.\s*/, ''),
          options: [],
          answer: '',
          isShortAnswer: false,
        };
      } else if (/^[A-D]\)/.test(trimmed) && currentQ && !currentQ.isShortAnswer) {
        currentQ.options.push(trimmed);
      } else if (/^Answer:\s*([A-D])/.test(trimmed) && currentQ) {
        currentQ.answer = trimmed.match(/^Answer:\s*([A-D])/)[1];
      } else if (/^Answer:\s*$/i.test(trimmed) && currentQ) {
        currentQ.isShortAnswer = true;
        currentQ.answer = '';
      } else if (currentQ && currentQ.isShortAnswer && trimmed && !/^=+$/.test(trimmed)) {
        currentQ.answer = trimmed;
      }
    }
    if (currentQ) parsed.push(currentQ);
    
    // Shuffle questions
    return parsed.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setQuestions(parseQuiz(content));
  }, [content, attemptNumber]);

  const handleAnswer = (qIndex, answer) => {
    setAnswers(prev => ({ ...prev, [qIndex]: answer }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswer = (answers[i] || '').trim().toLowerCase();
      const correctAnswer = (q.answer || '').trim().toLowerCase();
      if (userAnswer === correctAnswer) correct++;
    });
    setCorrectCount(correct);
    const score = (correct / questions.length) * 100;
    const didPass = score >= 60;
    setPassed(didPass);
    setShowResults(true);

    if (didPass && onPass) onPass(correct, questions.length);
    if (!didPass && onFail) onFail(correct, questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setPassed(false);
    setAttemptNumber(prev => prev + 1);
  };

  const allAnswered = questions.every((_, i) => {
    const ans = answers[i];
    return ans !== undefined && ans !== null && ans.trim() !== '';
  });

  if (questions.length === 0) {
    return <p className="text-gray-500">No quiz questions found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg flex items-center justify-between">
        <h3 className="font-semibold text-purple-700 dark:text-purple-300">
          📝 Quiz: {questions.length} Questions
        </h3>
        <span className="text-sm text-gray-500">Attempt #{attemptNumber}</span>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="font-medium mb-3">
            <span className="text-purple-600 font-bold">Q{qIndex + 1}.</span> {q.question}
          </p>

          {q.options.length > 0 && !q.isShortAnswer ? (
            <div className="space-y-2">
              {q.options.map((option, oIndex) => {
                const optionLetter = String.fromCharCode(65 + oIndex);
                const isSelected = answers[qIndex] === optionLetter;
                const isCorrect = showResults && q.answer === optionLetter;
                const isWrong = showResults && isSelected && q.answer !== optionLetter;

                return (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : isWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`attempt${attemptNumber}_q${qIndex}`}
                      value={optionLetter}
                      checked={isSelected}
                      onChange={() => handleAnswer(qIndex, optionLetter)}
                      disabled={showResults}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm">{option}</span>
                    {showResults && isCorrect && <span className="ml-auto">✓</span>}
                    {showResults && isWrong && <span className="ml-auto">✗</span>}
                  </label>
                );
              })}
            </div>
          ) : (
            <div>
              <textarea
                value={answers[qIndex] || ''}
                onChange={(e) => handleAnswer(qIndex, e.target.value)}
                rows={3}
                disabled={showResults}
                placeholder="Write your answer..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              />
            </div>
          )}
        </div>
      ))}

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
            allAnswered
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {allAnswered ? 'Submit Quiz' : 'Answer All Questions to Submit'}
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${passed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'}`}>
          <h3 className="font-semibold mb-2">
            {passed ? '✅ Quiz Passed!' : '📚 Not Passed Yet'}
          </h3>
          <p className="text-lg">
            Score: <span className="font-bold">{correctCount}/{questions.length}</span> ({Math.round((correctCount/questions.length)*100)}%)
          </p>
          {passed ? (
            <p className="text-sm text-green-600 mt-2">You can continue to the next lesson.</p>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                Review the material and try again. Questions will be shuffled.
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Retry Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
