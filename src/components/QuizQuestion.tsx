import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PixelBackground } from './ui/PixelBackground';

export function QuizQuestion() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { quiz, questions, currentPlayer, answers, submitAnswer, nextPlayerQuestion } = useGame();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestionIndex = currentPlayer?.current_question_index || 0;
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = answers.some((a) => a.question_id === currentQuestion?.id);

  useEffect(() => {
    if (!quiz || !currentPlayer) {
      navigate('/');
      return;
    }

    if (quiz.status === 'waiting') {
      navigate(`/game/${gameCode}/lobby`);
    } else if (quiz.status === 'finished' || currentPlayer.status === 'finished') {
      navigate(`/game/${gameCode}/results`);
    }
  }, [quiz, currentPlayer, navigate, gameCode]);

  useEffect(() => {
    setSelectedAnswer('');
    setTextAnswer('');
  }, [currentQuestionIndex]);

  async function handleSubmit() {
    if (!currentQuestion) return;

    const answer = currentQuestion.question_type === 'multiple_choice'
      ? selectedAnswer
      : textAnswer;

    if (!answer.trim()) return;

    setIsSubmitting(true);
    await submitAnswer(currentQuestion.id, answer);
    setIsSubmitting(false);
  }

  async function handleNextQuestion() {
    const { finished } = await nextPlayerQuestion();
    if (finished) {
      navigate(`/game/${gameCode}/results`);
    }
  }

  if (!quiz || !currentPlayer || !currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-2xl relative z-10">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between font-pixel text-[8px] text-retro-gray mb-2">
            <span className="text-retro-cyan">ROUND {currentQuestionIndex + 1} OF {questions.length}</span>
            <span className="text-retro-green">{Math.round(progress)}% COMPLETE</span>
          </div>
          <div className="w-full bg-retro-black border-2 border-retro-gray h-4">
            <div
              className="bg-retro-cyan h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 10px #00fff5'
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {currentQuestion.category && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-retro-purple border-2 border-retro-magenta font-pixel text-[10px] text-retro-magenta uppercase">
                {currentQuestion.category}
              </span>
            </div>
          )}
          <h2 className="font-retro text-2xl md:text-3xl text-retro-yellow mb-6">
            {currentQuestion.question_text}
          </h2>

          {currentQuestion.image_url && (
            <div className="mb-6 border-3 border-retro-gray p-3" style={{ borderWidth: '3px' }}>
              <img
                src={currentQuestion.image_url}
                alt="Question"
                className="max-h-64 mx-auto object-contain"
              />
            </div>
          )}

          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-3 cursor-pointer transition-all ${
                    selectedAnswer === option
                      ? 'border-retro-cyan bg-retro-cyan/10 shadow-neon-cyan'
                      : 'border-retro-gray hover:border-retro-magenta'
                  } ${hasAnswered ? 'pointer-events-none opacity-75' : ''}`}
                  style={{ borderWidth: '3px' }}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={hasAnswered}
                    className="sr-only"
                  />
                  <span className={`w-10 h-10 border-2 flex items-center justify-center mr-4 font-pixel text-sm ${
                    selectedAnswer === option
                      ? 'border-retro-cyan bg-retro-cyan text-retro-black'
                      : 'border-retro-gray text-retro-gray'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-retro text-xl text-retro-white">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={hasAnswered}
                placeholder="TYPE YOUR ANSWER HERE..."
                className="w-full p-4 bg-retro-black border-3 border-retro-gray font-retro text-xl text-retro-green-dark placeholder-retro-gray focus:border-retro-cyan focus:shadow-neon-cyan focus:outline-none transition-all min-h-[120px] resize-none disabled:opacity-75"
                style={{ borderWidth: '3px' }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {!hasAnswered ? (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (currentQuestion.question_type === 'multiple_choice'
                  ? !selectedAnswer
                  : !textAnswer.trim())
              }
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? 'SUBMITTING...' : 'LOCK IN ANSWER'}
            </Button>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-4">
              <p className="font-pixel text-[10px] text-retro-green neon-text-green">
                ANSWER LOCKED!
              </p>
              <Button
                onClick={handleNextQuestion}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                {currentQuestionIndex + 1 < questions.length
                  ? 'NEXT ROUND'
                  : 'FINISH QUEST'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
