import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { gameApi } from '../lib/api';
import { getRandomAvatar } from '../lib/avatars';
import type { Quiz, Player, Question, Answer } from '../types';

interface GameContextType {
  quiz: Quiz | null;
  players: Player[];
  questions: Question[];
  currentPlayer: Player | null;
  answers: Answer[];
  setQuiz: (quiz: Quiz | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  joinGame: (gameCode: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => Promise<void>;
  submitAnswer: (questionId: string, answerText: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  nextPlayerQuestion: () => Promise<{ finished: boolean }>;
  refreshGameState: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

const POLL_INTERVAL = 2000; // Poll every 2 seconds

export function GameProvider({ children }: { children: ReactNode }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!quiz) return;

    // Initial fetch
    fetchPlayers();
    fetchQuestions();
    fetchAnswers();

    // Set up polling for real-time updates
    pollIntervalRef.current = window.setInterval(() => {
      fetchQuizState();
      fetchPlayers();
      fetchAnswers();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [quiz?.id]);

  async function fetchQuizState() {
    if (!quiz) return;
    const updatedQuiz = await gameApi.getQuiz(quiz.id);
    if (updatedQuiz) {
      setQuiz(updatedQuiz);
    }
  }

  async function fetchPlayers() {
    if (!quiz) return;
    try {
      const data = await gameApi.getPlayers(quiz.id);
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  }

  async function fetchQuestions() {
    if (!quiz) return;
    try {
      const data = await gameApi.getQuestions(quiz.id);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  }

  async function fetchAnswers() {
    if (!quiz || !currentPlayer) return;
    try {
      const data = await gameApi.getAnswers(currentPlayer.id);
      setAnswers(data);
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    }
  }

  async function joinGame(gameCode: string, playerName: string) {
    // Find the quiz by game code
    const quizData = await gameApi.getQuizByCode(gameCode);

    if (!quizData) {
      return { success: false, error: 'Quiz not found. Please check the game code.' };
    }

    if (quizData.status === 'finished') {
      return { success: false, error: 'This quiz has already ended.' };
    }

    // Fetch existing players to get their avatar IDs
    const existingPlayers = await gameApi.getPlayers(quizData.id);
    const usedAvatarIds = existingPlayers.map(p => p.avatar_id);
    const avatar = getRandomAvatar(usedAvatarIds);

    try {
      // Create player with random avatar
      const playerData = await gameApi.createPlayer(quizData.id, playerName, avatar.id);
      setQuiz(quizData);
      setCurrentPlayer(playerData);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to join the game.' };
    }
  }

  async function startGame() {
    if (!quiz) return;
    await gameApi.updateQuizStatus(quiz.id, 'active');
    await fetchQuizState();
  }

  async function submitAnswer(questionId: string, answerText: string) {
    if (!currentPlayer) return;

    const question = questions.find(q => q.id === questionId);
    const isCorrect = question?.correct_answers.some(
      answer => answer.toLowerCase() === answerText.toLowerCase()
    ) ?? false;

    await gameApi.submitAnswer(currentPlayer.id, questionId, answerText, isCorrect);
    await fetchAnswers();
  }

  async function nextQuestion() {
    if (!quiz) return;
    const nextIndex = quiz.current_question_index + 1;

    if (nextIndex >= questions.length) {
      await gameApi.updateQuizStatus(quiz.id, 'finished');
    } else {
      // Note: This would require an endpoint to update current_question_index
      // For now, we update the whole quiz status
      await fetchQuizState();
    }
  }

  async function nextPlayerQuestion(): Promise<{ finished: boolean }> {
    if (!quiz || !currentPlayer) return { finished: false };

    const nextIndex = currentPlayer.current_question_index + 1;

    if (nextIndex >= questions.length) {
      // Player has finished all questions
      const updatedPlayer = await gameApi.updatePlayer(currentPlayer.id, { status: 'finished' });
      setCurrentPlayer(updatedPlayer);

      // Check if all players have finished
      const allPlayers = await gameApi.getPlayers(quiz.id);
      const playingPlayers = allPlayers.filter(p => p.status === 'playing');

      if (playingPlayers.length === 0) {
        await gameApi.updateQuizStatus(quiz.id, 'finished');
      }

      return { finished: true };
    } else {
      // Move to next question
      const updatedPlayer = await gameApi.updatePlayer(currentPlayer.id, { currentQuestionIndex: nextIndex });
      setCurrentPlayer(updatedPlayer);
      return { finished: false };
    }
  }

  async function refreshGameState() {
    if (!quiz) return;
    await fetchQuizState();
    await fetchPlayers();
    await fetchQuestions();
    await fetchAnswers();
  }

  return (
    <GameContext.Provider
      value={{
        quiz,
        players,
        questions,
        currentPlayer,
        answers,
        setQuiz,
        setCurrentPlayer,
        joinGame,
        startGame,
        submitAnswer,
        nextQuestion,
        nextPlayerQuestion,
        refreshGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
