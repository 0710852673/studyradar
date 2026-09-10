import { useCallback, useEffect, useState } from "react";

export type SavedKind = "Guide" | "Video" | "Reel" | "Opportunity" | "Answer";

export type SavedItem = {
  id: string;
  title: string;
  kind: SavedKind;
  note?: string;
  href?: string;
  savedAt: string;
};

const KEY = "studyradar.saved.v1";

function read(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    /* storage full or unavailable — saving is best-effort */
  }
  window.dispatchEvent(new CustomEvent("studyradar:saved"));
}

/** Saved content shared across Learn, Reels, Opportunities and the Saved page. */
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener("studyradar:saved", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("studyradar:saved", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isSaved = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      const current = read();
      const exists = current.some((i) => i.id === item.id);
      const next = exists
        ? current.filter((i) => i.id !== item.id)
        : [{ ...item, savedAt: new Date().toISOString() }, ...current];
      write(next);
      setItems(next);
      return !exists;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    const next = read().filter((i) => i.id !== id);
    write(next);
    setItems(next);
  }, []);

  return { items, isSaved, toggle, remove };
}
