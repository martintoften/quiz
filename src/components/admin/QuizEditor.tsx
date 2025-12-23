import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { generateGameCode } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { PixelBackground } from '../ui/PixelBackground';
import { QuestionForm } from './QuestionForm';
import type { Question } from '../../types';

export function QuizEditor() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const isNew = quizId === 'new';

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && quizId) {
      fetchQuiz();
      fetchQuestions();
    }
  }, [isNew, quizId]);

  async function fetchQuiz() {
    try {
      const data = await adminApi.getQuiz(quizId!);
      setTitle(data.title);
      setSavedQuizId(data.id);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    }
  }

  async function fetchQuestions() {
    try {
      const data = await adminApi.getQuestions(quizId!);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  }

  async function handleSaveQuiz() {
    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (isNew || !savedQuizId) {
        const data = await adminApi.createQuiz(title.trim(), generateGameCode());
        setSavedQuizId(data.id);
        navigate(`/admin/quiz/${data.id}`, { replace: true });
      } else {
        await adminApi.updateQuiz(savedQuizId, { title: title.trim() });
      }
    } catch (err) {
      setError('Failed to save quiz');
      console.error(err);
    }

    setIsSaving(false);
  }

  async function handleAddQuestion(question: Omit<Question, 'id' | 'quiz_id' | 'created_at'>) {
    if (!savedQuizId) {
      setError('Please save the quiz first');
      return;
    }

    try {
      await adminApi.createQuestion(savedQuizId, question);
      fetchQuestions();
    } catch (error) {
      setError('Failed to add question');
      console.error(error);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    try {
      await adminApi.deleteQuestion(questionId);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  }

  async function handleUpdateQuestionOrder(questionId: string, newIndex: number) {
    try {
      await adminApi.updateQuestionOrder(questionId, newIndex);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to update question order:', error);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <PixelBackground />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="font-pixel text-lg md:text-xl text-retro-magenta neon-text-magenta">
            {isNew ? 'CREATE QUEST' : 'EDIT QUEST'}
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
            >
              BACK
            </Button>
            {savedQuizId && (
              <Button
                onClick={() => navigate('/admin')}
                variant="secondary"
              >
                FINISH
              </Button>
            )}
          </div>
        </div>

        {/* Quiz Title */}
        <Card className="mb-6">
          <h2 className="font-pixel text-[10px] text-retro-cyan mb-4">QUEST DETAILS</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Quest Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ENTER QUEST TITLE"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveQuiz} disabled={isSaving}>
                {isSaving ? 'SAVING...' : savedQuizId ? 'UPDATE' : 'SAVE'}
              </Button>
            </div>
          </div>
          {error && <p className="font-pixel text-[8px] text-retro-red mt-2 uppercase">{error}</p>}
        </Card>

        {/* Questions */}
        {savedQuizId && (
          <>
            <Card className="mb-6">
              <h2 className="font-pixel text-[10px] text-retro-green mb-4">
                ROUNDS ({questions.length})
              </h2>

              {questions.length === 0 ? (
                <p className="font-retro text-lg text-retro-gray text-center py-4">
                  NO QUESTIONS ADDED YET
                </p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-4 p-4 bg-retro-black/50 border-2 border-retro-gray"
                    >
                      <span className="w-8 h-8 bg-retro-cyan text-retro-black flex items-center justify-center font-pixel text-xs flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-retro text-lg text-retro-white mb-2 break-words">
                          {question.question_text}
                        </p>
                        {question.image_url && (
                          <div className="mb-3 border-2 border-retro-gray p-2 inline-block">
                            <img
                              src={question.image_url}
                              alt="Question"
                              className="max-h-24 object-contain"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                          <span className="font-pixel text-[8px] px-2 py-0.5 bg-retro-purple border border-retro-magenta text-retro-magenta uppercase">
                            {question.question_type.replace('_', ' ')}
                          </span>
                          <span className="font-retro text-retro-green">
                            {question.correct_answers.length > 1 ? 'Answers: ' : 'Answer: '}
                            {question.correct_answers.join(', ')}
                          </span>
                        </div>
                        {question.options && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {question.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`font-pixel text-[8px] px-2 py-1 border ${
                                  question.correct_answers.includes(opt)
                                    ? 'border-retro-green bg-retro-green/20 text-retro-green'
                                    : 'border-retro-gray text-retro-gray'
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {index > 0 && (
                          <button
                            onClick={() =>
                              handleUpdateQuestionOrder(
                                question.id,
                                questions[index - 1].order_index
                              )
                            }
                            className="text-retro-gray hover:text-retro-cyan font-pixel text-lg"
                          >
                            ^
                          </button>
                        )}
                        {index < questions.length - 1 && (
                          <button
                            onClick={() =>
                              handleUpdateQuestionOrder(
                                question.id,
                                questions[index + 1].order_index
                              )
                            }
                            className="text-retro-gray hover:text-retro-cyan font-pixel text-lg"
                          >
                            v
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-retro-gray hover:text-retro-red font-pixel text-lg"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="green">
              <h2 className="font-pixel text-[10px] text-retro-green mb-4">
                ADD NEW ROUND
              </h2>
              <QuestionForm
                onSubmit={handleAddQuestion}
                nextOrderIndex={questions.length}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
