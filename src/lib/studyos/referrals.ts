export function buildReferralSignupUrl(origin: string, code: string): string {
  const url = new URL("/auth", origin);
  url.searchParams.set("mode", "signup");
  url.searchParams.set("ref", code.trim());
  return url.toString();
}
