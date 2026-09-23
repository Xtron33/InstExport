import { useExport } from '../../../lib/store/export.store';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './error-modal.module.css';
import { useTranslation } from 'react-i18next';

export function ErrorModal() {
  const { t } = useTranslation();
  const error = useExport((state) => state.error);
  const dismissError = useExport((state) => state.dismissError);

  if (!error) return null;

  return (
    <Modal title={t('error.title')} kind="error" onClose={dismissError}>
      <p className={styles.message}>{error}</p>
      <Button className={styles.closeButton} onClick={dismissError}>
        {t('export.close')}
      </Button>
    </Modal>
  );
}
