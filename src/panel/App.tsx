import { MODES } from '../lib/const';
import {
  Button,
  DocInfo,
  Notice,
  Eyebrow,
  Header,
  ModeCard,
  Preview,
  Export,
  Confirmation,
  ErrorModal,
  ResultModal,
  Space,
} from './components';

import styles from './App.module.css';
import { useActiveDocument } from '../lib/store/active-document.store';
import { usePlan } from '../lib/hooks/use-plan';

import { useExport } from '../lib/store/export.store';
import { useTranslation } from 'react-i18next';

export function App() {
  const { t, i18n } = useTranslation();
  const { mode, setMode, phase, busy, start } = useExport();
  const info = useActiveDocument((state) => state.document);
  const { plan, error: planError } = usePlan({ mode, language: i18n.language });

  return (
    <>
      <main className={styles.main}>
        <Header />
        <DocInfo />
        <Space h={20} />
        <Eyebrow title={t('app.mode')} />
        <Space h={12} />
        <div className={styles.modes}>
          {MODES.map((item) => (
            <ModeCard
              key={item.id}
              item={item}
              onClick={setMode}
              isActive={mode === item.id}
              disabled={busy}
            />
          ))}
        </div>
        <Space h={20} />
        <Eyebrow title={t('app.preview')} />
        <Space h={12} />
        {planError && <Notice variant={'error'} text={planError} />}
        {plan && <Preview plan={plan} />}
        <Space h={20} />
        <Export />
        <Space h={20} />
        <Button className={styles.save} onClick={() => start(info, plan)} disabled={busy || !plan}>
          {phase === 'running'
            ? t('app.saving')
            : phase === 'checking'
              ? t('app.preparing')
              : t('app.save')}
        </Button>
        <footer className={styles.footer}>
          <div>{t('app.quality')}</div>
          <div>{t('app.sourceUnchanged')}</div>
        </footer>
      </main>
      <Confirmation />
      <ErrorModal />
      <ResultModal />
    </>
  );
}
