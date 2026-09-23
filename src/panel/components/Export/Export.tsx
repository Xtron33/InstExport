import { useExport } from '../../../lib/store/export.store';
import { Eyebrow } from '../Eyebrow/Eyebrow';
import { Button } from '../Button/Button';

import styles from './export.module.css';
import { useTranslation } from 'react-i18next';

export const Export = () => {
  const { t } = useTranslation();
  const folder = useExport((state) => state.folder);
  const busy = useExport((state) => state.busy);
  const pickFolder = useExport((state) => state.pickFolder);

  return (
    <section>
      <Eyebrow title={t('export.title')} />
      <p className={styles.path}>{folder?.nativePath || t('export.folderPrompt')}</p>
      <Button className={styles.button} disabled={busy} onClick={pickFolder}>
        {t('export.chooseFolder')}
      </Button>
    </section>
  );
};
