import { useExport } from '../../../lib/store/export.store';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './result-modal.module.css';
import { useTranslation } from 'react-i18next';

export function ResultModal() {
  const { t } = useTranslation();
  const status = useExport((state) => state.status);
  const report = useExport((state) => state.report);
  const error = useExport((state) => state.error);
  const busy = useExport((state) => state.busy);
  const dismissResult = useExport((state) => state.dismissResult);

  if (error || (!status && !report)) return null;

  return (
    <Modal title={t('export.title')} onClose={dismissResult}>
      {status && (
        <p role="status" className={styles.status}>
          {status}
        </p>
      )}
      {report && (
        <div className={styles.report}>
          {report.saved.map((name) => (
            <p className={styles.item} key={name}>
              {t('export.saved', { name })}
            </p>
          ))}
          {report.warnings.map((warning, index) => (
            <p className={styles.warning} key={index}>
              {warning}
            </p>
          ))}
        </div>
      )}
      {!busy && (
        <Button className={styles.closeButton} onClick={dismissResult}>
          {t('export.close')}
        </Button>
      )}
    </Modal>
  );
}
