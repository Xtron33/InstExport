import { FC } from 'react';

import styles from './notice.module.css';
import clsx from 'clsx';

interface Props {
  text: string;
  variant?: 'error' | 'warning';
}

export const Notice: FC<Props> = ({ text, variant = 'warning' }) => (
  <div
    className={clsx(styles.container, {
      [styles.error]: variant === 'error',
      [styles.warning]: variant === 'warning',
    })}
  >
    {text}
  </div>
);
