import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizGameProps {
  onComplete: (score: number) => void;
}

export const MultiplayerQuiz: React.FC<QuizGameProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Sample quiz questions
  const questions: QuizQuestion[] = [
    {
      id: '1',
      question: 'Ni lugha gani inatumika zaidi kwa web development?',
      options: ['Python', 'JavaScript', 'Java', 'C++'],
      correctAnswer: 1,
      points: 10,
    },
    {
      id: '2',
      question: 'React ni framework ya lugha gani?',
      options: ['Python', 'Ruby', 'JavaScript', 'PHP'],
      correctAnswer: 2,
      points: 10,
    },
    {
      id: '3',
      question: 'Ni database gani ni relational?',
      options: ['MongoDB', 'PostgreSQL', 'Redis', 'Firebase'],
      correctAnswer: 1,
      points: 10,
    },
    {
      id: '4',
      question: 'HTTP status code 404 inamaanisha nini?',
      options: ['Success', 'Not Found', 'Server Error', 'Redirect'],
      correctAnswer: 1,
      points: 10,
    },
    {
      id: '5',
      question: 'Git ni tool ya kufanya nini?',
      options: ['Database', 'Version Control', 'Web Server', 'Email'],
      correctAnswer: 1,
      points: 10,
    },
  ];

  useEffect(() => {
    if (gameOver || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, gameOver, showResult]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + questions[currentQuestion].points);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGameOver(true);
      onComplete(score);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setShowResult(false);
  };

  if (gameOver) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <Trophy size={64} color="#fbbf24" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Mchezo Umekwisha!</h2>
        <p style={{ fontSize: 48, fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
          {score} / {questions.length * 10}
        </p>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>
          Points Zilizopatikana
        </p>
        <button
          onClick={restartGame}
          className="btn-primary"
          style={{ padding: '12px 32px', fontSize: 16 }}
        >
          Cheza Tena
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Gamepad2 size={24} color="#a5b4fc" />
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Quiz Challenge</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Swali {currentQuestion + 1} / {questions.length}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: 12,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Trophy size={16} color="#fbbf24" />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>{score}</span>
          </div>
          <div style={{
            padding: '8px 16px',
            borderRadius: 12,
            background: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${timeLeft <= 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Clock size={16} color={timeLeft <= 10 ? '#ef4444' : '#10b981'} />
            <span style={{ fontSize: 16, fontWeight: 700, color: timeLeft <= 10 ? '#ef4444' : '#10b981' }}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{
        padding: 24,
        borderRadius: 12,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-app)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 0, lineHeight: 1.5 }}>
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              style={{
                padding: 16,
                borderRadius: 12,
                background: showCorrect
                  ? 'rgba(16, 185, 129, 0.2)'
                  : showWrong
                  ? 'rgba(239, 68, 68, 0.2)'
                  : isSelected
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'var(--bg-subtle)',
                border: `2px solid ${
                  showCorrect
                    ? '#10b981'
                    : showWrong
                    ? '#ef4444'
                    : isSelected
                    ? '#6366f1'
                    : 'var(--border-app)'
                }`,
                color: 'var(--text-main)',
                cursor: showResult ? 'not-allowed' : 'pointer',
                fontSize: 16,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{option}</span>
              {showCorrect && <CheckCircle2 size={20} color="#10b981" />}
              {showWrong && <XCircle size={20} color="#ef4444" />}
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {!showResult && (
        <button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          className="btn-primary"
          style={{
            width: '100%',
            padding: 16,
            fontSize: 16,
            opacity: selectedAnswer === null ? 0.5 : 1,
            cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
          }}
        >
          Jibu
        </button>
      )}

      {/* Result Message */}
      {showResult && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: selectedAnswer === question.correctAnswer
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${
            selectedAnswer === question.correctAnswer
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(239, 68, 68, 0.3)'
          }`,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 18,
            fontWeight: 600,
            color: selectedAnswer === question.correctAnswer ? '#10b981' : '#ef4444',
            margin: 0,
          }}>
            {selectedAnswer === question.correctAnswer ? '✓ Sahihi!' : '✗ Si Sahihi'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
            {selectedAnswer === question.correctAnswer
              ? `+${question.points} points`
              : 'Jibu sahihi: ' + question.options[question.correctAnswer]}
          </p>
        </div>
      )}
    </div>
  );
};
