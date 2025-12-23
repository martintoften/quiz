import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'cyan' | 'magenta' | 'green' | 'christmas';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const borderColors = {
    default: 'border-xmas-red',
    cyan: 'border-retro-cyan',
    magenta: 'border-retro-magenta',
    green: 'border-retro-green',
    christmas: 'border-xmas-red',
  };

  const glowColors = {
    default: 'rgba(255, 26, 26, 0.08)',
    cyan: 'rgba(0, 255, 245, 0.05)',
    magenta: 'rgba(255, 0, 255, 0.05)',
    green: 'rgba(0, 255, 0, 0.05)',
    christmas: 'rgba(255, 26, 26, 0.1)',
  };

  const isChristmas = variant === 'default' || variant === 'christmas';

  return (
    <div
      className={cn(
        'bg-retro-dark border-4 p-6 md:p-8 relative overflow-hidden',
        borderColors[variant],
        'shadow-[8px_8px_0_#000]',
        className
      )}
      style={{
        boxShadow: `8px 8px 0 #000, inset 0 0 50px ${glowColors[variant]}`,
      }}
    >
      {isChristmas && (
        <>
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 text-xmas-red animate-pulse text-lg">✦</div>
          <div className="absolute top-2 right-2 text-xmas-green animate-pulse text-lg" style={{ animationDelay: '0.5s' }}>✦</div>
          <div className="absolute bottom-2 left-2 text-xmas-green animate-pulse text-lg" style={{ animationDelay: '0.3s' }}>✦</div>
          <div className="absolute bottom-2 right-2 text-xmas-red animate-pulse text-lg" style={{ animationDelay: '0.8s' }}>✦</div>
        </>
      )}
      {children}
    </div>
  );
}
