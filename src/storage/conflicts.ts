import type { FolderEntry } from '../photoshop/types';
import i18n from '../i18n';
export async function findConflicts(folder: FolderEntry, names: string[]): Promise<string[]> {
  const existing = await folder.getEntries();
  const byName = new Map(existing.map((entry) => [entry.name.toLowerCase(), entry]));
  const conflicts: string[] = [];
  for (const name of names) {
    const entry = byName.get(name.toLowerCase());
    if (entry && !entry.isFile) throw new Error(i18n.t('storage.folderConflict', { name }));
    if (entry) conflicts.push(name);
  }
  return conflicts;
}
