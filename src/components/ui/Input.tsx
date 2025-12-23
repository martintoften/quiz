import { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-pixel text-[10px] text-retro-cyan mb-2 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-3 bg-retro-black border-3 border-retro-gray',
          'font-retro text-xl text-retro-green-dark placeholder-retro-gray',
          'focus:border-retro-cyan focus:shadow-neon-cyan focus:outline-none',
          'transition-all duration-200',
          error && 'border-retro-red focus:border-retro-red focus:shadow-neon-red',
          className
        )}
        style={{ borderWidth: '3px' }}
        {...props}
      />
      {error && (
        <p className="mt-2 font-pixel text-[8px] text-retro-red uppercase">
          {error}
        </p>
      )}
    </div>
  );
}
