import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PixelBackground } from '../ui/PixelBackground';
import type { Quiz } from '../../types';

export function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const data = await adminApi.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
    setIsLoading(false);
  }

  async function handleDeleteQuiz(quizId: string) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await adminApi.deleteQuiz(quizId);
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  }

  async function handleResetQuiz(quizId: string) {
    try {
      await adminApi.resetQuiz(quizId);
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to reset quiz:', error);
    }
  }

  function handleLogout() {
    logout();
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-retro-yellow/20 text-retro-yellow border-retro-yellow';
      case 'active':
        return 'bg-retro-green/20 text-retro-green border-retro-green';
      case 'finished':
        return 'bg-retro-gray/20 text-retro-gray border-retro-gray';
      default:
        return 'bg-retro-gray/20 text-retro-gray border-retro-gray';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <PixelBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-pixel text-xl md:text-2xl text-retro-cyan neon-text-cyan">
            QUIZ DASHBOARD
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/admin/quiz/new')}
              variant="primary"
            >
              CREATE QUIZ
            </Button>
            <Button onClick={handleLogout} variant="outline">
              LOGOUT
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-retro-cyan border-t-transparent mx-auto animate-spin" />
              <p className="mt-4 font-retro text-lg text-retro-gray">LOADING...</p>
            </div>
          </Card>
        ) : quizzes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="font-retro text-xl text-retro-gray mb-4">NO QUIZZES CREATED YET</p>
              <Button onClick={() => navigate('/admin/quiz/new')}>
                CREATE YOUR FIRST QUIZ
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-pixel text-sm text-retro-white mb-2">
                      {quiz.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="font-pixel text-[10px] bg-retro-black border-2 border-retro-cyan px-2 py-1 text-retro-cyan">
                        {quiz.game_code}
                      </span>
                      <span
                        className={`font-pixel text-[8px] px-2 py-1 border uppercase ${getStatusStyle(
                          quiz.status
                        )}`}
                      >
                        {quiz.status}
                      </span>
                      <span className="font-retro text-retro-gray">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/admin/quiz/${quiz.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      EDIT
                    </Button>
                    <Button
                      onClick={() => handleResetQuiz(quiz.id)}
                      variant="secondary"
                      size="sm"
                    >
                      RESET
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      variant="danger"
                      size="sm"
                    >
                      DELETE
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
