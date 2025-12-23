import { getAvatarById } from '../../lib/avatars';
import { cn } from '../../lib/utils';

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAccessory?: boolean;
}

export function Avatar({ avatarId, size = 'md', className, showAccessory = true }: AvatarProps) {
  const avatar = getAvatarById(avatarId);

  if (!avatar) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'border-2 border-retro-cyan',
        'shadow-[2px_2px_0_#000]',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: avatar.backgroundColor }}
      title={`${avatar.name} - ${avatar.accessory}`}
    >
      <span className="select-none" role="img" aria-label={avatar.name}>
        {avatar.emoji}
      </span>
      {showAccessory && (
        <span className="absolute -top-1 -right-1 text-xs">
          {getAccessoryEmoji(avatar.id)}
        </span>
      )}
    </div>
  );
}

function getAccessoryEmoji(avatarId: string): string {
  const accessories: Record<string, string> = {
    'reindeer': '🔴',
    'polar-bear': '🎅',
    'penguin': '🧣',
    'owl': '🎧',
    'fox': '🧤',
    'rabbit': '🎀',
    'cat': '🧶',
    'dog': '🦌',
    'mouse': '🧀',
    'hedgehog': '🍒',
    'seal': '🔔',
    'otter': '🍬',
    'squirrel': '🌰',
    'sloth': '😴',
    'koala': '🌿',
    'panda': '🎁',
  };
  return accessories[avatarId] || '';
}
