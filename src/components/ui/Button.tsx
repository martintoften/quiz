import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'festive';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'font-pixel uppercase tracking-wider',
    'border-4 transition-all duration-100',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-retro-dark',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:translate-x-1 active:translate-y-1 active:shadow-none'
  );

  const variants = {
    primary: cn(
      'bg-retro-dark text-xmas-red border-xmas-red',
      'shadow-[4px_4px_0_#000]',
      'hover:shadow-[6px_6px_0_#000,0_0_20px_#ff1a1a]',
      'focus:ring-xmas-red'
    ),
    secondary: cn(
      'bg-retro-dark text-xmas-green border-xmas-green',
      'shadow-[4px_4px_0_#000]',
      'hover:shadow-[6px_6px_0_#000,0_0_20px_#00cc44]',
      'focus:ring-xmas-green'
    ),
    outline: cn(
      'bg-transparent text-retro-magenta border-retro-magenta',
      'shadow-[4px_4px_0_#000]',
      'hover:bg-retro-magenta/10 hover:shadow-[6px_6px_0_#000,0_0_20px_#ff00ff]',
      'focus:ring-retro-magenta'
    ),
    danger: cn(
      'bg-retro-dark text-retro-red border-retro-red',
      'shadow-[4px_4px_0_#000]',
      'hover:shadow-[6px_6px_0_#000,0_0_20px_#ff0040]',
      'focus:ring-retro-red'
    ),
    festive: cn(
      'bg-xmas-red text-white border-xmas-green',
      'shadow-[4px_4px_0_#000]',
      'hover:shadow-[6px_6px_0_#000,0_0_15px_#ff1a1a,0_0_25px_#00cc44]',
      'focus:ring-xmas-gold',
      'animate-pulse'
    ),
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[8px]',
    md: 'px-5 py-2.5 text-[10px]',
    lg: 'px-8 py-3.5 text-xs',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
