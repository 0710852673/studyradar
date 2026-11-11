/**
 * In-app notification centre.
 *
 * The local list is a lightweight UI cache. Achievement awards themselves are
 * persisted in Supabase so they sync across devices and are visible to admins.
 * Outbound achievement email is disabled in 1.0; awards feed in-app notices only.
 */

export type NoticeKind = "achievement" | "security" | "system";

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
}

const MAX = 40;
const key = (userId: string) => `sr_notices_${userId}`;

type Listener = () => void;
const listeners = new Set<Listener>();
const cache = new Map<string, Notice[]>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeNotices(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getNotices(userId: string): Notice[] {
  if (cache.has(userId)) return cache.get(userId)!;
  let list: Notice[] = [];
  try {
    const raw = localStorage.getItem(key(userId));
    if (raw) list = JSON.parse(raw) as Notice[];
  } catch {
    list = [];
  }
  cache.set(userId, list);
  return list;
}

function save(userId: string, list: Notice[]) {
  const trimmed = list.slice(0, MAX);
  cache.set(userId, trimmed);
  try {
    localStorage.setItem(key(userId), JSON.stringify(trimmed));
  } catch {
    /* storage disabled */
  }
  emit();
}

/** Adds a notice unless one with the same id already exists. Returns true if new. */
export function pushNotice(
  userId: string,
  notice: Omit<Notice, "at" | "read"> & { at?: number },
): boolean {
  const list = getNotices(userId);
  if (list.some((n) => n.id === notice.id)) return false;
  save(userId, [{ ...notice, at: notice.at ?? Date.now(), read: false }, ...list]);
  return true;
}

export function markAllRead(userId: string) {
  const list = getNotices(userId);
  if (!list.some((n) => !n.read)) return;
  save(
    userId,
    list.map((n) => ({ ...n, read: true })),
  );
}

export function clearNotices(userId: string) {
  save(userId, []);
}

export function unreadCount(userId: string) {
  return getNotices(userId).filter((n) => !n.read).length;
}
