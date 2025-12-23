import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PixelBackground } from './ui/PixelBackground';
import { Avatar } from './ui/Avatar';

export function Lobby() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { quiz, players, currentPlayer, startGame } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quiz || !currentPlayer) {
      navigate('/');
      return;
    }

    if (quiz.status === 'active') {
      navigate(`/game/${gameCode}/play`);
    } else if (quiz.status === 'finished') {
      navigate(`/game/${gameCode}/results`);
    }
  }, [quiz, currentPlayer, navigate, gameCode]);

  async function handleStartGame() {
    await startGame();
    navigate(`/game/${gameCode}/play`);
  }

  if (!quiz || !currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-lg md:text-xl text-retro-magenta neon-text-magenta mb-4">
            PLAYER SELECT
          </h1>
          <div className="inline-block bg-retro-black border-2 border-retro-cyan px-4 py-2 shadow-[4px_4px_0_#000]">
            <span className="font-pixel text-[8px] text-retro-gray block mb-1">GAME CODE</span>
            <span className="font-pixel text-lg text-retro-cyan neon-text-cyan tracking-widest">
              {quiz.gameCode}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-pixel text-[10px] text-retro-green mb-4 flex items-center gap-2">
            <span>PLAYERS READY</span>
            <span className="bg-retro-green text-retro-black px-2 py-0.5 text-[8px]">
              {players.length}
            </span>
          </h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center p-3 border-2 ${
                  player.id === currentPlayer.id
                    ? 'border-retro-yellow bg-retro-yellow/10'
                    : 'border-retro-gray bg-retro-black/50'
                }`}
              >
                <span className="font-pixel text-[10px] text-retro-cyan mr-3">
                  P{index + 1}
                </span>
                <Avatar avatarId={player.avatar_id} size="sm" className="mr-3" />
                <span className="font-retro text-lg text-retro-white">
                  {player.name}
                  {player.id === currentPlayer.id && (
                    <span className="ml-2 font-pixel text-[8px] text-retro-yellow">(YOU)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="font-retro text-lg text-retro-gray mb-4 animate-pulse">
            WAITING FOR PLAYERS...
          </p>
          <Button onClick={handleStartGame} size="lg" className="w-full">
            START QUEST
          </Button>
        </div>
      </Card>
    </div>
  );
}
