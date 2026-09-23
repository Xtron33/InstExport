import { useActiveDocument } from '../../../lib/store/active-document.store';
import styles from './doc-info.module.css';
import { useTranslation } from 'react-i18next';

export const DocInfo = () => {
  const { t } = useTranslation();
  const info = useActiveDocument((s) => s.document);

  return (
    <section className={styles.card}>
      <p className={styles.name}>{info?.name ?? t('document.open')}</p>
      {info && (
        <p className={styles.sizes}>
          {info.width} × {info.height} px
        </p>
      )}
    </section>
  );
};
