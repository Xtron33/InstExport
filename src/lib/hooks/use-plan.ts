import { useMemo } from 'react';
import { buildPlan, type Plan } from '../../geometry/plans';
import { useActiveDocument } from '../store/active-document.store';
import type { Mode } from '../types';
import i18n from '../../i18n';

interface Props {
  mode: Mode;
  language?: string;
}

interface UsePlanResult {
  plan: Plan | null;
  error: string | null;
}

export const usePlan = ({ mode, language = i18n.language }: Props): UsePlanResult => {
  const source = useActiveDocument((state) => state.document);

  return useMemo(() => {
    const t = i18n.getFixedT(language);
    if (!source) {
      return { plan: null, error: t('document.required') };
    }

    try {
      return { plan: buildPlan(source, mode), error: null };
    } catch (error) {
      return {
        plan: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [mode, source, language]);
};
