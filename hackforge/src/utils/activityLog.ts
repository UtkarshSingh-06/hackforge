export type ActivityType = 'add' | 'update' | 'delete' | 'activate' | 'deactivate';

export interface ActivityEntry {
  id: string;
  at: string;
  type: ActivityType;
  subscriptionId: number;
  subscriptionName: string;
}

const STORAGE_KEY = 'subscriptionTrackerActivity';
const MAX_ENTRIES = 500;

function isValidEntry(x: unknown): x is ActivityEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.at === 'string' &&
    typeof o.type === 'string' &&
    typeof o.subscriptionId === 'number' &&
    typeof o.subscriptionName === 'string'
  );
}

export function loadActivitiesFromStorage(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export function saveActivitiesToStorage(entries: ActivityEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving activity log:', e);
  }
}

export function pushActivity(
  entries: ActivityEntry[],
  partial: Omit<ActivityEntry, 'id' | 'at'>
): ActivityEntry[] {
  const entry: ActivityEntry = {
    ...partial,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    at: new Date().toISOString(),
  };
  const next = [entry, ...entries].slice(0, MAX_ENTRIES);
  saveActivitiesToStorage(next);
  return next;
}

export function getCalendarMonthRange(ref: Date): { start: Date; end: Date } {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function filterActivitiesInMonth(
  entries: ActivityEntry[],
  ref: Date = new Date()
): ActivityEntry[] {
  const { start, end } = getCalendarMonthRange(ref);
  const t0 = start.getTime();
  const t1 = end.getTime();
  return entries
    .filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= t0 && t <= t1;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function countActivityByType(
  entries: ActivityEntry[]
): Record<ActivityType, number> {
  const counts: Record<ActivityType, number> = {
    add: 0,
    update: 0,
    delete: 0,
    activate: 0,
    deactivate: 0,
  };
  for (const e of entries) {
    counts[e.type]++;
  }
  return counts;
}
