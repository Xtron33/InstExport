import { FC } from 'react';

import styles from './eyebrow.module.css';

interface Props {
  title: string;
}

export const Eyebrow: FC<Props> = ({ title }) => (
  <div className={styles.eyebrow}>{title.toUpperCase()}</div>
);
