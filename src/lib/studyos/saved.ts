import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SavedKind = "Guide" | "Video" | "Reel" | "Opportunity" | "Answer" | "Resource";

export type SavedItem = {
  id: string;
  title: string;
  kind: SavedKind;
  note?: string | undefined;
  href?: string | undefined;
  savedAt: string;
};

/** Saved content stored per account in the database (private to each student). */
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("saved_items")
      .select("item_key,title,kind,note,href,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
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
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isSaved = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("saved_items").delete().eq("item_key", id);
      if (error) throw error;
      await load();
    },
    [load],
  );

  const toggle = useCallback(
    async (item: Omit<SavedItem, "savedAt">) => {
      if (items.some((i) => i.id === item.id)) {
        await remove(item.id);
        return false;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in to save");
      const { error } = await supabase.from("saved_items").insert({
        user_id: auth.user.id,
        item_key: item.id,
        title: item.title.slice(0, 200),
        kind: item.kind,
        note: item.note ?? null,
        href: item.href ?? null,
      });
      if (error) throw error;
      await load();
      return true;
    },
    [items, load, remove],
  );

  return { items, loading, isSaved, toggle, remove };
}
