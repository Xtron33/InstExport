import clsx from 'clsx';
import type { KeyboardEvent, ReactNode } from 'react';
import styles from './button.module.css';

interface Props {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel?: string;
  pressed?: boolean;
}

export function Button({
  children,
  className,
  disabled = false,
  onClick,
  ariaLabel,
  pressed,
}: Props) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (event.key === 'Enter') onClick();
  }

  function handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled || event.key !== ' ') return;
    event.preventDefault();
    onClick();
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={clsx(styles.button, disabled && styles.disabled, className)}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {children}
    </div>
  );
}
