import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (!quiz) return;

    // Subscribe to player changes
    const playersChannel = supabase
      .channel(`players:${quiz.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `quiz_id=eq.${quiz.id}` },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    // Subscribe to quiz changes
    const quizChannel = supabase
      .channel(`quiz:${quiz.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${quiz.id}` },
        (payload) => {
          setQuiz(payload.new as Quiz);
        }
      )
      .subscribe();

    // Subscribe to answer changes
    const answersChannel = supabase
      .channel(`answers:${quiz.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'answers' },
        () => {
          fetchAnswers();
        }
      )
      .subscribe();

    fetchPlayers();
    fetchQuestions();
    fetchAnswers();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(quizChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [quiz?.id]);

  async function fetchPlayers() {
    if (!quiz) return;
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data);
  }

  async function fetchQuestions() {
    if (!quiz) return;
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });
    if (data) setQuestions(data);
  }

  async function fetchAnswers() {
    if (!quiz || !currentPlayer) return;
    const { data } = await supabase
      .from('answers')
      .select('*')
      .eq('player_id', currentPlayer.id);
    if (data) setAnswers(data);
  }

  async function joinGame(gameCode: string, playerName: string) {
    // Find the quiz by game code
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('game_code', gameCode.toUpperCase())
      .single();

    if (quizError || !quizData) {
      return { success: false, error: 'Quiz not found. Please check the game code.' };
    }

    if (quizData.status === 'finished') {
      return { success: false, error: 'This quiz has already ended.' };
    }

    // Fetch existing players to get their avatar IDs
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('avatar_id')
      .eq('quiz_id', quizData.id);

    const usedAvatarIds = existingPlayers?.map(p => p.avatar_id) || [];
    const avatar = getRandomAvatar(usedAvatarIds);

    // Create player with random avatar
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        quiz_id: quizData.id,
        name: playerName,
        avatar_id: avatar.id,
        status: 'playing',
        current_question_index: 0
      })
      .select()
      .single();

    if (playerError) {
      return { success: false, error: 'Failed to join the game.' };
    }

    setQuiz(quizData);
    setCurrentPlayer(playerData);
    return { success: true };
  }

  async function startGame() {
    if (!quiz) return;
    await supabase
      .from('quizzes')
      .update({ status: 'active', current_question_index: 0 })
      .eq('id', quiz.id);
  }

  async function submitAnswer(questionId: string, answerText: string) {
    if (!currentPlayer) return;

    const question = questions.find(q => q.id === questionId);
    const isCorrect = question?.correct_answers.some(
      answer => answer.toLowerCase() === answerText.toLowerCase()
    ) ?? false;

    await supabase.from('answers').upsert({
      player_id: currentPlayer.id,
      question_id: questionId,
      answer_text: answerText,
      is_correct: isCorrect,
    }, { onConflict: 'player_id,question_id' });

    await fetchAnswers();
  }

  async function nextQuestion() {
    if (!quiz) return;
    const nextIndex = quiz.current_question_index + 1;

    if (nextIndex >= questions.length) {
      await supabase
        .from('quizzes')
        .update({ status: 'finished' })
        .eq('id', quiz.id);
    } else {
      await supabase
        .from('quizzes')
        .update({ current_question_index: nextIndex })
        .eq('id', quiz.id);
    }
  }

  async function nextPlayerQuestion(): Promise<{ finished: boolean }> {
    if (!quiz || !currentPlayer) return { finished: false };

    const nextIndex = currentPlayer.current_question_index + 1;

    if (nextIndex >= questions.length) {
      // Player has finished all questions
      await supabase
        .from('players')
        .update({ status: 'finished' })
        .eq('id', currentPlayer.id);

      // Update local state
      setCurrentPlayer({ ...currentPlayer, status: 'finished' });

      // Check if all players have finished
      const { data: remainingPlayers } = await supabase
        .from('players')
        .select('id')
        .eq('quiz_id', quiz.id)
        .eq('status', 'playing');

      // If this was the last player (only current player was playing)
      if (!remainingPlayers || remainingPlayers.length === 0) {
        await supabase
          .from('quizzes')
          .update({ status: 'finished' })
          .eq('id', quiz.id);
      }

      return { finished: true };
    } else {
      // Move to next question
      await supabase
        .from('players')
        .update({ current_question_index: nextIndex })
        .eq('id', currentPlayer.id);

      // Update local state
      setCurrentPlayer({ ...currentPlayer, current_question_index: nextIndex });

      return { finished: false };
    }
  }

  async function refreshGameState() {
    if (!quiz) return;
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quiz.id)
      .single();
    if (data) setQuiz(data);
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
