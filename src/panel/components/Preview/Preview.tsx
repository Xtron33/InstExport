import type { FC } from 'react';
import type { Layout, Plan, PreviewPlan } from '../../../geometry/plans';

import styles from './preview.module.css';
import { useTranslation } from 'react-i18next';
import { useImagePreview } from '../../../lib/hooks/use-image-preview';
import { Notice } from '../Notice/Notice';
import { Space } from '../Space/Space';

function paddingText(value: Layout, t: ReturnType<typeof useTranslation>['t']) {
  const p = value.padding;
  if (!Object.values(p).some(Boolean)) return t('preview.noPadding');
  return t('preview.padding', p);
}

interface DiagramProps {
  preview: PreviewPlan;
}

const Diagram: FC<DiagramProps> = ({ preview }) => {
  const { t } = useTranslation();
  const { dataUrl, error, loading } = useImagePreview(preview);

  return (
    <div
      className={styles.diagram}
      style={{ width: preview.canvas.width, height: preview.canvas.height }}
    >
      {dataUrl && (
        <img
          className={styles.image}
          src={dataUrl}
          alt={t('preview.imageAlt')}
          style={{
            left: preview.offset.left,
            top: preview.offset.top,
            width: preview.image.width,
            height: preview.image.height,
          }}
        />
      )}
      {loading && <span className={styles.state}>{t('preview.loading')}</span>}
      {error && <span className={styles.state}>{t('preview.unavailable')}</span>}
      {preview.seams.map((left) => (
        <div key={left} className={styles.seam} style={{ left }} />
      ))}
    </div>
  );
};

interface Props {
  plan: Plan;
}

export const Preview: FC<Props> = ({ plan }) => {
  const { t } = useTranslation();
  const outputCount = plan.outputs.length;

  return (
    <section className={styles.container}>
      <div className={styles.firstLine}>
        <span className={styles.eyebrow}>{t('preview.result')}</span>
        <span className={styles.count}>{t('preview.files', { count: outputCount })}</span>
      </div>
      {plan.previews.map((preview) => {
        const slices = preview.kind === 'slices';
        const previewLayout = slices ? plan.strip! : plan.full;

        return (
          <div className={styles.previewBlock} key={preview.kind}>
            <Diagram preview={preview} />
            <p className={styles.caption}>
              {slices ? t('preview.slices', { count: plan.count }) : t('preview.full')}
            </p>
            <p className={styles.paddings}>{paddingText(previewLayout, t)}</p>
          </div>
        );
      })}
      <div className={styles.outputs}>
        {plan.outputs.map((output) => (
          <div className={styles.output} key={output.name}>
            <span className={styles.name}>{output.name}</span>
            <span>
              {output.size.width} × {output.size.height}
            </span>
          </div>
        ))}
      </div>
      {plan.warnings.map((w) => (
        <>
          <Space h={12} />
          <Notice text={w} key={w} />
        </>
      ))}
    </section>
  );
};
