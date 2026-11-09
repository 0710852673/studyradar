export type ShareResult = "shared" | "copied" | "cancelled" | "unavailable";

export type ShareAdapter = {
  share?: ((data: ShareData) => Promise<void>) | undefined;
  copy?: ((text: string) => Promise<void>) | undefined;
};

export function buildInviteUrl(origin: string, referralCode?: string | null): string {
  const url = new URL(referralCode ? "/auth" : "/", origin);
  if (referralCode) url.searchParams.set("ref", referralCode);
  return url.toString();
}

async function legacyCopy(text: string): Promise<void> {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Copy unavailable");
}

export async function copyLink(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for denied clipboard permissions and non-secure contexts.
    }
  }
  await legacyCopy(text);
}

/** Native share first, then clipboard; cancellation never becomes an error toast. */
export async function shareLink(url: string, adapter?: ShareAdapter): Promise<ShareResult> {
  const share = adapter?.share ?? (navigator.share ? navigator.share.bind(navigator) : undefined);
  const copy = adapter?.copy ?? copyLink;
  if (share) {
    try {
      await share({
        title: "Study Radar",
        text: "Track study time, marks and exam progress with me on Study Radar.",
        url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await copy(url);
    return "copied";
  } catch {
    return "unavailable";
  }
}
