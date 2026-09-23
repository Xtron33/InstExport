import type { Layout, Plan } from '../geometry/plans';
import i18n from '../i18n';

export interface Driver<D> {
  duplicate(source: D): Promise<D>;
  prepare(doc: D): Promise<void>;
  resize(doc: D, layout: Layout): Promise<void>;
  crop(doc: D, left: number, right: number): Promise<void>;
  save(doc: D, name: string): Promise<void>;
  close(doc: D): Promise<void>;
  restore(source: D): Promise<void>;
  checkCancelled(): void;
}
export interface ExportReport {
  saved: string[];
  warnings: string[];
}
export class ExportFailure extends Error {
  constructor(
    message: string,
    public report: ExportReport,
  ) {
    super(message);
    this.name = 'ExportFailure';
  }
}
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// This orchestration has no UXP dependency, allowing cleanup and failure paths to be tested.
export async function exportPlan<D>(
  source: D,
  plan: Plan,
  driver: Driver<D>,
  progress: (message: string) => void,
): Promise<ExportReport> {
  const report: ExportReport = { saved: [], warnings: [] };
  const pending = new Set<D>();
  async function copy<T>(from: D, operation: (doc: D) => Promise<T>): Promise<T> {
    driver.checkCancelled();
    const doc = await driver.duplicate(from);
    pending.add(doc);
    try {
      return await operation(doc);
    } finally {
      try {
        await driver.close(doc);
        pending.delete(doc);
      } catch {
        /* Retry at the end; the host also registers automatic closing on cancel. */
      }
    }
  }
  async function save(doc: D, name: string) {
    driver.checkCancelled();
    progress(
      i18n.t('export.savingFile', {
        current: report.saved.length + 1,
        total: plan.outputs.length,
        name,
      }),
    );
    await driver.save(doc, name);
    report.saved.push(name);
  }
  let failure: unknown;
  try {
    await copy(source, async (full) => {
      progress(i18n.t('export.preparingPhoto'));
      await driver.prepare(full);
      await driver.resize(full, plan.full);
      await save(full, plan.outputs[0].name);
    });
    if (plan.strip)
      await copy(source, async (strip) => {
        progress(i18n.t('export.preparingStrip', { count: plan.count }));
        await driver.prepare(strip);
        await driver.resize(strip, plan.strip!);
        for (const output of plan.outputs.slice(1)) {
          const index = output.slice!;
          await copy(strip, async (part) => {
            await driver.crop(part, index * 1080, (index + 1) * 1080);
            await save(part, output.name);
          });
        }
      });
  } catch (error) {
    failure = error;
  } finally {
    for (const doc of pending) {
      try {
        await driver.close(doc);
      } catch (error) {
        report.warnings.push(i18n.t('export.closeTemporaryFailed', { message: messageOf(error) }));
      }
    }
    try {
      await driver.restore(source);
    } catch (error) {
      report.warnings.push(i18n.t('export.restoreSourceFailed', { message: messageOf(error) }));
    }
  }
  if (failure !== undefined) throw new ExportFailure(messageOf(failure), report);
  return report;
}
