import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Card } from './ui/Card';
import { PixelBackground } from './ui/PixelBackground';

export function WaitingLobby() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { quiz, players, currentPlayer } = useGame();
  const navigate = useNavigate();

  const finishedPlayers = players.filter((p) => p.status === 'finished');
  const playingPlayers = players.filter((p) => p.status === 'playing');

  useEffect(() => {
    if (!quiz || !currentPlayer) {
      navigate('/');
      return;
    }

    if (quiz.status === 'waiting') {
      navigate(`/game/${gameCode}/lobby`);
    } else if (quiz.status === 'finished') {
      navigate(`/game/${gameCode}/results`);
    } else if (currentPlayer.status === 'playing') {
      navigate(`/game/${gameCode}/play`);
    }
  }, [quiz, currentPlayer, navigate, gameCode]);

  if (!quiz || !currentPlayer) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-xl md:text-2xl text-retro-green neon-text-green mb-2">
            QUEST COMPLETE!
          </h1>
          <p className="font-retro text-lg text-retro-gray">
            WAITING FOR OTHER PLAYERS...
          </p>
        </div>

        <div className="mb-6">
          <h2 className="font-pixel text-[10px] text-retro-green mb-4 flex items-center gap-2">
            <span>FINISHED</span>
            <span className="bg-retro-green text-retro-black px-2 py-0.5 text-[8px]">
              {finishedPlayers.length}
            </span>
          </h2>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {finishedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center p-3 border-2 border-retro-green bg-retro-green/10"
              >
                <span className="w-6 h-6 bg-retro-green text-retro-black flex items-center justify-center text-xs mr-3 font-pixel">
                  OK
                </span>
                <span className="font-retro text-lg text-retro-white">
                  {player.name}
                  {player.id === currentPlayer.id && (
                    <span className="ml-2 font-pixel text-[8px] text-retro-green">(YOU)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {playingPlayers.length > 0 && (
          <div>
            <h2 className="font-pixel text-[10px] text-retro-yellow mb-4 flex items-center gap-2">
              <span>STILL PLAYING</span>
              <span className="bg-retro-yellow text-retro-black px-2 py-0.5 text-[8px]">
                {playingPlayers.length}
              </span>
            </h2>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {playingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center p-3 border-2 border-retro-gray bg-retro-black/50"
                >
                  <div className="w-6 h-6 border-2 border-retro-yellow flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-retro-yellow animate-pulse" />
                  </div>
                  <span className="font-retro text-lg text-retro-gray">
                    {player.name}
                  </span>
                  <span className="ml-auto font-pixel text-[8px] text-retro-cyan">
                    Q{player.current_question_index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-retro-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-retro-magenta animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-retro-yellow animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="font-retro text-sm text-retro-gray mt-4">
            PLEASE WAIT...
          </p>
        </div>
      </Card>
    </div>
  );
}
