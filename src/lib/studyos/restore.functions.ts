import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const row = z.record(z.string(), z.unknown()) as unknown as z.ZodType<Row>;
type Row = { id?: unknown; user_id?: unknown; [k: string]: unknown };
const Input = z.object({
  dryRun: z.boolean(),
  sessions: z.array(row).max(50000).default([]),
  wasted: z.array(row).max(50000).default([]),
  marks: z.array(row).max(50000).default([]),
  chapters: z.array(row).max(50000).default([]),
});

type TableName = "study_sessions" | "wasted_time" | "marks" | "chapters";
const COLS: Record<TableName, string[]> = {
  study_sessions: ["id", "user_id", "date", "subject", "minutes", "note", "created_at"],
  wasted_time: ["id", "user_id", "date", "minutes", "reason", "created_at"],
  marks: ["id", "user_id", "subject", "exam_name", "marks", "total", "date", "created_at"],
  chapters: ["id", "user_id", "subject", "title", "status", "position", "created_at"],
};
const uuid = /^[0-9a-f-]{36}$/i;

export type RestoreReport = {
  table: TableName;
  inBackup: number;
  valid: number;
  skippedUnknownUser: number;
  alreadyPresent: number;
  inserted: number;
  verified: number;
};

/**
 * Restores rows from an admin JSON backup. Never overwrites: existing ids are
 * left untouched, rows for deleted accounts are skipped, and every restored id
 * is read back afterwards to verify it landed.
 */
export const restoreBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can restore backups.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: profiles } = await db.from("profiles").select("id");
    const users = new Set<string>((profiles ?? []).map((p: { id: string }) => p.id));

    const plan: [TableName, Row[]][] = [
      ["study_sessions", data.sessions],
      ["wasted_time", data.wasted],
      ["marks", data.marks],
      ["chapters", data.chapters],
    ];
    const reports: RestoreReport[] = [];

    for (const [table, rows] of plan) {
      const clean = rows
        .filter((r) => typeof r.id === "string" && uuid.test(r.id) && typeof r.user_id === "string")
        .map((r): Row => Object.fromEntries(COLS[table].filter((c) => c in r).map((c) => [c, r[c]])));
      const owned = clean.filter((r) => users.has(r.user_id as string));
      const ids = owned.map((r) => r.id as string);

      const existing = new Set<string>();
      for (let i = 0; i < ids.length; i += 500) {
        const { data: got } = await db.from(table).select("id").in("id", ids.slice(i, i + 500));
        (got ?? []).forEach((g: { id: string }) => existing.add(g.id));
      }
      const fresh = owned.filter((r) => !existing.has(r.id as string));

      let inserted = 0;
      if (!data.dryRun) {
        for (let i = 0; i < fresh.length; i += 500) {
          const chunk = fresh.slice(i, i + 500);
          const { error } = await db.from(table).upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
          if (error) throw new Error(`${table}: ${error.message}`);
          inserted += chunk.length;
        }
      }

      let verified = 0;
      if (!data.dryRun) {
        for (let i = 0; i < ids.length; i += 500) {
          const { count } = await db
            .from(table)
            .select("id", { count: "exact", head: true })
            .in("id", ids.slice(i, i + 500));
          verified += count ?? 0;
        }
      }

      reports.push({
        table,
        inBackup: rows.length,
        valid: clean.length,
        skippedUnknownUser: clean.length - owned.length,
        alreadyPresent: existing.size,
        inserted,
        verified,
      });
    }

    if (!data.dryRun) {
      await db.from("security_events").insert({
        user_id: context.userId,
        kind: "backup_restored",
        severity: "warning",
        detail: reports.map((r) => `${r.table}: +${r.inserted}`).join(", "),
      });
    }
    return { dryRun: data.dryRun, reports };
  });
