import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { PixelBackground } from '../ui/PixelBackground';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelBackground />
      <Card className="w-full max-w-md relative z-10" variant="magenta">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-xl md:text-2xl text-retro-magenta neon-text-magenta mb-4">
            CONTROL ROOM
          </h1>
          <p className="font-retro text-lg text-retro-gray">
            ADMIN ACCESS REQUIRED
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ENTER USERNAME"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ENTER PASSWORD"
          />

          {error && (
            <p className="font-pixel text-[10px] text-retro-red text-center uppercase">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" variant="outline" disabled={isLoading}>
            {isLoading ? 'CONNECTING...' : 'ACCESS SYSTEM'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="font-pixel text-[8px] text-retro-gray hover:text-retro-cyan transition-colors uppercase"
          >
            Back to Game
          </a>
        </div>
      </Card>
    </div>
  );
}
