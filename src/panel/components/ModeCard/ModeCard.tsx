import styles from './mode-card.module.css';
import { WorkMode } from '../../../lib/types';
import { FC } from 'react';
import clsx from 'clsx';
import Icon from '@mdi/react';
import { Button } from '../Button/Button';
import { useTranslation } from 'react-i18next';

interface Props {
  item: WorkMode;
  isActive: boolean;
  disabled?: boolean;
  onClick(value: number): void;
}

export const ModeCard: FC<Props> = ({ item, isActive, disabled, onClick }) => {
  const { t } = useTranslation();
  return (
    <Button
      className={clsx(styles.card, isActive && styles.active)}
      onClick={() => onClick(item.id)}
      disabled={disabled}
    >
      <Icon path={item.icon} size={2} />
      <span className={styles.title}>{t(item.title)}</span>
    </Button>
  );
};
