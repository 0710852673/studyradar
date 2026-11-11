import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPages } from "./pagination";

export type SavedKind = "Guide" | "Video" | "Reel" | "Opportunity" | "Answer" | "Resource";

export type SavedItem = {
  id: string;
  title: string;
  kind: SavedKind;
  note?: string | undefined;
  href?: string | undefined;
  savedAt: string;
};

/** Saved content is scoped to the active account and reloads when auth becomes ready or changes. */
export function useSaved(userId: string | null | undefined) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await fetchAllPages((from, to) =>
      supabase.from("saved_items").select("item_key,title,kind,note,href,created_at")
        .eq("user_id", userId).order("created_at", { ascending: false })
        .order("id", { ascending: true }).range(from, to),
    );
    if (loadError) {
      setItems([]);
      setError(loadError.message);
    } else {
      setItems(
        (data ?? []).map((r) => ({
          id: r.item_key,
          title: r.title,
          kind: r.kind as SavedKind,
          note: r.note ?? undefined,
          href: r.href ?? undefined,
          savedAt: r.created_at,
        })),
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isSaved = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const remove = useCallback(async (id: string) => {
    if (!userId) throw new Error("Sign in to manage saved items.");
    const { error: removeError } = await supabase
      .from("saved_items")
      .delete()
      .eq("item_key", id)
      .eq("user_id", userId);
    if (removeError) throw removeError;
    await load();
  }, [load, userId]);

  const toggle = useCallback(async (item: Omit<SavedItem, "savedAt">) => {
    if (!userId) throw new Error("Sign in to save");
    if (items.some((saved) => saved.id === item.id)) {
      await remove(item.id);
      return false;
    }
    const { error: insertError } = await supabase.from("saved_items").insert({
      user_id: userId,
      item_key: item.id,
      title: item.title.slice(0, 200),
      kind: item.kind,
      note: item.note ?? null,
      href: item.href ?? null,
    });
    if (insertError) {
      if (insertError.code === "23505") {
        await load();
        return false;
      }
      throw insertError;
    }
    await load();
    return true;
  }, [items, load, remove, userId]);

  return { items, loading, error, isSaved, toggle, remove, refresh: load };
}
