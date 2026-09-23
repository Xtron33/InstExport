import { useExport } from '../../../lib/store/export.store';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './confirmation.module.css';
import { useTranslation } from 'react-i18next';

export function Confirmation() {
  const { t } = useTranslation();
  const pending = useExport((state) => state.pending);
  const cancel = useExport((state) => state.cancel);
  const confirm = useExport((state) => state.confirm);
  if (!pending) return null;

  return (
    <Modal title={t('confirmation.title')} onClose={cancel}>
      <p className={styles.text}>{t('confirmation.existing')}</p>
      <div className={styles.conflicts}>
        {pending.conflicts.map((name) => (
          <p className={styles.item} key={name}>
            {name}
          </p>
        ))}
      </div>
      <div className={styles.actions}>
        <Button className={styles.cancel} onClick={cancel}>
          {t('confirmation.cancel')}
        </Button>
        <Button className={styles.replace} onClick={confirm}>
          {t('confirmation.replace', { count: pending.conflicts.length })}
        </Button>
      </div>
    </Modal>
  );
}
