export type SecuritySeverity = "info" | "warning" | "critical";
const SECURITY_EVENT_KINDS = new Set(["sign_in_failed", "google_sign_in_failed"]);

export function sanitizeSecurityEvent(input: {
  kind: string;
  severity?: SecuritySeverity;
  email?: string | null;
  detail?: string;
}) {
  if (!SECURITY_EVENT_KINDS.has(input.kind)) return null;
  const email = input.email?.trim().toLowerCase() ?? "";
  return {
    kind: input.kind,
    severity: input.severity === "critical" ? "critical" as const : input.severity === "warning" ? "warning" as const : "info" as const,
    email: email && email.length <= 254 ? email : null,
    detail: input.detail?.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 160) || null,
  };
}
