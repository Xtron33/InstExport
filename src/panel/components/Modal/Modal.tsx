import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';
import clsx from 'clsx';

interface Props {
  title: string;
  children: ReactNode;
  onClose: () => void;
  kind?: 'dialog' | 'alertdialog' | 'error';
}

export function Modal({ title, children, onClose, kind = 'dialog' }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          '[tabindex="0"], button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ) ?? [],
      );

    (focusable()[0] ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first || !last) {
          event.preventDefault();
          dialog?.focus();
        } else if (
          event.shiftKey &&
          (!dialog?.contains(document.activeElement) ||
            document.activeElement === dialog ||
            document.activeElement === first)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (!dialog?.contains(document.activeElement) || document.activeElement === last)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay}>
      <section
        ref={dialogRef}
        className={clsx(styles.dialog, {
          [styles.error]: kind === 'error',
        })}
        role={kind}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </section>
    </div>,
    document.body,
  );
}
