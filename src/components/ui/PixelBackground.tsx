import { useEffect, useState } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  animationDelay: number;
  color: string;
}

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
}

interface Ornament {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  delay: number;
}

export function PixelBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);

  useEffect(() => {
    // More red in the star colors
    const colors = ['#ff1a1a', '#ff1a1a', '#ff1a1a', '#00cc44', '#ffd700', '#ffffff', '#ff1a1a', '#00cc44'];
    const newStars: Star[] = [];

    for (let i = 0; i < 80; i++) {
      newStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        animationDelay: Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setStars(newStars);

    // Generate snowflakes
    const newSnowflakes: Snowflake[] = [];
    for (let i = 0; i < 60; i++) {
      newSnowflakes.push({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        swayDuration: 3 + Math.random() * 4,
      });
    }
    setSnowflakes(newSnowflakes);

    // Generate floating ornaments on the sides
    const ornamentColors = ['#ff1a1a', '#ff1a1a', '#00cc44', '#ffd700', '#ff1a1a'];
    const newOrnaments: Ornament[] = [];
    for (let i = 0; i < 12; i++) {
      newOrnaments.push({
        id: i,
        left: i % 2 === 0 ? Math.random() * 15 : 85 + Math.random() * 15,
        top: 10 + Math.random() * 80,
        size: 10 + Math.random() * 15,
        color: ornamentColors[Math.floor(Math.random() * ornamentColors.length)],
        delay: Math.random() * 3,
      });
    }
    setOrnaments(newOrnaments);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-retro-purple via-retro-dark to-retro-black" />

      {/* Grid lines - with red tint */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 26, 26, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 26, 26, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Perspective grid at bottom - red/green mix */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(255, 26, 26, 0.08) 100%
            )
          `,
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 26, 26, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 204, 68, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            animationDelay: `${star.animationDelay}s`,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
          }}
        />
      ))}

      {/* Falling Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={`snow-${flake.id}`}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 4px #ffffff, 0 0 8px rgba(255,255,255,0.5)',
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            imageRendering: 'pixelated',
          }}
        />
      ))}

      {/* Christmas Lights - Top decoration */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-4 py-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`light-${i}`}
            className="animate-xmas-lights"
            style={{
              width: '8px',
              height: '12px',
              backgroundColor: i % 2 === 0 ? '#ff1a1a' : '#00cc44',
              borderRadius: '0 0 4px 4px',
              boxShadow: `0 0 12px ${i % 2 === 0 ? '#ff1a1a' : '#00cc44'}`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Ornaments */}
      {ornaments.map((ornament) => (
        <div
          key={`ornament-${ornament.id}`}
          className="absolute animate-float-pixel"
          style={{
            left: `${ornament.left}%`,
            top: `${ornament.top}%`,
            width: `${ornament.size}px`,
            height: `${ornament.size}px`,
            backgroundColor: ornament.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${ornament.size}px ${ornament.color}, inset 0 0 ${ornament.size / 3}px rgba(255,255,255,0.3)`,
            animationDelay: `${ornament.delay}s`,
          }}
        >
          {/* Ornament cap */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2"
            style={{
              width: `${ornament.size / 3}px`,
              height: `${ornament.size / 4}px`,
              backgroundColor: '#ffd700',
              borderRadius: '2px 2px 0 0',
            }}
          />
        </div>
      ))}

      {/* Animated candy canes on corners */}
      <div className="absolute bottom-4 left-4 text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
        🎄
      </div>
      <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        🎄
      </div>

      {/* Vignette effect with red tint */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
