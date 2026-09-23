import { create } from 'zustand/react';
import type { Plan } from '../../geometry/plans';
import { chooseFolder, runExport } from '../../photoshop/host';
import type { FolderEntry } from '../../photoshop/types';
import { findConflicts } from '../../storage/conflicts';
import { ExportFailure, type ExportReport, messageOf } from '../../workflows/export';
import { Mode, type DocumentInformation } from '../types';
import i18n from '../../i18n';

type Pending = { info: DocumentInformation; plan: Plan; folder: FolderEntry; conflicts: string[] };

type Store = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  folder: FolderEntry | null;
  phase: 'idle' | 'checking' | 'confirm' | 'running';
  busy: boolean;
  status: string;
  error: string;
  report: ExportReport | null;
  pending: Pending | null;
  resetResult: () => void;
  dismissError: () => void;
  dismissResult: () => void;
  pickFolder: () => Promise<void>;
  start: (info: DocumentInformation | null, plan: Plan | null) => Promise<void>;
  cancel: () => void;
  confirm: () => Promise<void>;
};

export const useExport = create<Store>((set, get) => {
  function setPhase(phase: Store['phase'], state: Partial<Omit<Store, 'phase' | 'busy'>> = {}) {
    set({ ...state, phase, busy: phase !== 'idle' });
  }

  async function execute(job: Pending, replace: boolean) {
    setPhase('running', { pending: null, status: i18n.t('export.preparing') });
    try {
      const report = await runExport(
        job.info,
        job.plan,
        job.folder,
        replace ? job.conflicts : [],
        (status) => set({ status }),
      );
      set({ report, status: i18n.t('export.complete', { count: report.saved.length }) });
    } catch (error) {
      set({ error: messageOf(error), status: i18n.t('export.incomplete') });
      if (error instanceof ExportFailure) set({ report: error.report });
    } finally {
      setPhase('idle');
    }
  }

  return {
    mode: +(localStorage.getItem('mode') ?? Mode.Universal),
    setMode: (mode) => {
      set({ mode, report: null, error: '', status: '' });
      try {
        localStorage.setItem('mode', mode.toString());
      } catch {
        /* Session still works. */
      }
    },
    folder: null,
    phase: 'idle',
    busy: false,
    status: '',
    error: '',
    report: null,
    pending: null,

    resetResult: () => set({ report: null, error: '', status: '' }),
    dismissError: () => set({ error: '' }),
    dismissResult: () => {
      if (!get().busy) set({ status: '', report: null });
    },

    pickFolder: async () => {
      if (get().busy) return;
      setPhase('checking', { error: '' });
      try {
        const folder = await chooseFolder();
        if (folder) set({ folder, report: null });
      } catch (error) {
        set({ error: messageOf(error) });
      } finally {
        setPhase('idle');
      }
    },

    start: async (info, plan) => {
      if (get().busy || !info || !plan) return;
      setPhase('checking', { error: '', report: null, status: '' });
      try {
        const folder = get().folder ?? (await chooseFolder());
        if (!folder) {
          setPhase('idle');
          return;
        }
        set({ folder });
        const conflicts = await findConflicts(
          folder,
          plan.outputs.map((output) => output.name),
        );
        const job = { info, plan, folder, conflicts };
        if (conflicts.length) {
          setPhase('confirm', { pending: job });
          return;
        }
        await execute(job, false);
      } catch (error) {
        setPhase('idle', { error: messageOf(error) });
      }
    },

    cancel: () => {
      if (get().phase === 'confirm') setPhase('idle', { pending: null });
    },

    confirm: async () => {
      const { phase, pending } = get();
      if (phase === 'confirm' && pending) await execute(pending, true);
    },
  };
});
