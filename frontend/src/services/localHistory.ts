import type { HistoryEntry } from "@/types/history";

const STORAGE_KEY = "pixelpilot-history";
const MAX_HISTORY = 20;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addHistoryEntry(entry: HistoryEntry) {
  const entries = getHistory();

  // Prevent duplicates
  const filtered = entries.filter((e) => e.id !== entry.id);

  filtered.unshift(entry);

  saveHistory(filtered.slice(0, MAX_HISTORY));
}

export function renameHistoryEntryLocal(id: string, name: string) {
  const updated = getHistory().map((entry) =>
    entry.id === id
      ? {
          ...entry,
          name,
        }
      : entry,
  );

  saveHistory(updated);

  return updated.find((entry) => entry.id === id)!;
}

export function deleteHistoryEntryLocal(id: string) {
  saveHistory(getHistory().filter((entry) => entry.id !== id));
}

export function addEditedAssetLocal(
  historyId: string,
  asset: HistoryEntry["editedAssets"][number],
) {
  const updated = getHistory().map((entry) => {
    if (entry.id !== historyId) return entry;

    // Prevent duplicate edited assets
    if (entry.editedAssets.some((a) => a.id === asset.id)) {
      return entry;
    }

    return {
      ...entry,
      editedAssets: [...entry.editedAssets, asset],
    };
  });

  saveHistory(updated);
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}