import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { PixelBackground } from './ui/PixelBackground';

export function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { joinGame } = useGame();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    const result = await joinGame(gameCode.trim(), playerName.trim());
    setIsLoading(false);

    if (result.success) {
      navigate(`/game/${gameCode.toUpperCase()}/lobby`);
    } else {
      setError(result.error || 'Failed to join the game');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <p className="font-pixel text-[8px] md:text-[10px] text-xmas-gold neon-text-gold mb-2 animate-pulse">
            ★ HOLIDAY EDITION ★
          </p>
          <h1 className="font-pixel text-2xl md:text-3xl text-xmas-red animate-xmas-glow mb-4">
            QUIZ ARCADE
          </h1>
          <div className="flex justify-center gap-2 items-center">
            <span className="text-xmas-red animate-sparkle">❄</span>
            <p className="font-retro text-xl text-xmas-green neon-text-xmas-green animate-pulse">
              MERRY QUIZMAS!
            </p>
            <span className="text-xmas-green animate-sparkle" style={{ animationDelay: '0.5s' }}>❄</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Game Code"
            placeholder="ENTER 6-CHAR CODE"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-2xl tracking-widest uppercase font-pixel"
          />

          <Input
            label="Player Name"
            placeholder="ENTER YOUR NAME"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={30}
          />

          {error && (
            <p className="font-pixel text-[10px] text-retro-red text-center uppercase">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="festive"
            disabled={isLoading}
          >
            {isLoading ? 'JOINING...' : '🎁 START GAME 🎁'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="font-pixel text-[8px] text-retro-gray hover:text-retro-magenta transition-colors uppercase"
          >
            Admin Login
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="font-retro text-sm text-xmas-red neon-text-xmas-red animate-pulse">
            🎄 PRESS START TO UNWRAP THE FUN 🎄
          </p>
        </div>
      </Card>
    </div>
  );
}
