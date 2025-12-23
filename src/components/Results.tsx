import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PixelBackground } from './ui/PixelBackground';
import { Avatar } from './ui/Avatar';
import type { PlayerScore } from '../types';

export function Results() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { quiz, players, questions, currentPlayer } = useGame();
  const navigate = useNavigate();
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!quiz || !currentPlayer) {
      navigate('/');
      return;
    }

    if (quiz.status === 'waiting') {
      navigate(`/game/${gameCode}/lobby`);
    } else if (quiz.status === 'active') {
      navigate(`/game/${gameCode}/play`);
    }
  }, [quiz, currentPlayer, navigate, gameCode]);

  useEffect(() => {
    async function fetchScores() {
      if (!quiz) return;

      const { data: answersData } = await supabase
        .from('answers')
        .select('player_id, is_correct')
        .in(
          'question_id',
          questions.map((q) => q.id)
        );

      if (!answersData) {
        setIsLoading(false);
        return;
      }

      const playerScores: PlayerScore[] = players.map((player) => {
        const playerAnswers = answersData.filter((a) => a.player_id === player.id);
        const correctAnswers = playerAnswers.filter((a) => a.is_correct).length;

        return {
          player,
          correctAnswers,
          totalQuestions: questions.length,
        };
      });

      playerScores.sort((a, b) => b.correctAnswers - a.correctAnswers);
      setScores(playerScores);
      setIsLoading(false);
    }

    fetchScores();
  }, [quiz, players, questions]);

  function handlePlayAgain() {
    navigate('/');
  }

  if (!quiz || !currentPlayer) {
    return null;
  }

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return { text: '1ST', color: 'text-retro-yellow neon-text-yellow' };
      case 1:
        return { text: '2ND', color: 'text-retro-cyan neon-text-cyan' };
      case 2:
        return { text: '3RD', color: 'text-retro-magenta neon-text-magenta' };
      default:
        return { text: `${index + 1}TH`, color: 'text-retro-gray' };
    }
  };

  const currentPlayerScore = scores.find((s) => s.player.id === currentPlayer.id);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-retro-yellow neon-text-yellow mb-2 animate-pulse">
            GAME OVER
          </h1>
          <p className="font-pixel text-[10px] text-retro-cyan">HIGH SCORES</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-retro-cyan border-t-transparent mx-auto animate-spin" />
            <p className="mt-4 font-retro text-lg text-retro-gray">CALCULATING SCORES...</p>
          </div>
        ) : (
          <>
            {/* Current player score */}
            {currentPlayerScore && (
              <div className="bg-retro-purple border-4 border-retro-magenta p-6 mb-6 text-center shadow-[4px_4px_0_#000]">
                <p className="font-pixel text-[10px] text-retro-magenta mb-2">YOUR SCORE</p>
                <p className="font-pixel text-4xl text-retro-white neon-text my-2" style={{ textShadow: '0 0 10px #fff' }}>
                  {currentPlayerScore.correctAnswers} / {currentPlayerScore.totalQuestions}
                </p>
                <p className="font-retro text-xl text-retro-green">
                  {Math.round((currentPlayerScore.correctAnswers / currentPlayerScore.totalQuestions) * 100)}% CORRECT
                </p>
              </div>
            )}

            {/* Leaderboard */}
            <div className="mb-8">
              <h2 className="font-pixel text-[10px] text-retro-cyan mb-4 text-center">
                LEADERBOARD
              </h2>
              <div className="space-y-2">
                {scores.map((score, index) => {
                  const rank = getRankDisplay(index);
                  return (
                    <div
                      key={score.player.id}
                      className={`flex items-center justify-between p-3 border-2 ${
                        score.player.id === currentPlayer.id
                          ? 'border-retro-yellow bg-retro-yellow/10'
                          : 'border-retro-gray bg-retro-black/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`font-pixel text-[10px] w-10 ${rank.color}`}>
                          {rank.text}
                        </span>
                        <Avatar avatarId={score.player.avatar_id} size="sm" className="mx-2" />
                        <span className="font-retro text-lg text-retro-white">
                          {score.player.name}
                          {score.player.id === currentPlayer.id && (
                            <span className="ml-2 font-pixel text-[8px] text-retro-yellow">(YOU)</span>
                          )}
                        </span>
                      </div>
                      <span className="font-pixel text-sm text-retro-cyan">
                        {score.correctAnswers}/{score.totalQuestions}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={handlePlayAgain} size="lg" className="w-full">
              PLAY AGAIN?
            </Button>

            <p className="font-retro text-center text-retro-gray mt-4 animate-blink">
              CONTINUE? INSERT COIN...
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
