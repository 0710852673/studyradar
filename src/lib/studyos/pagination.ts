export type PageResult<T> = { data: T[] | null; error: { message: string } | null };
export type PageFetcher<T> = (from: number, to: number) => PromiseLike<PageResult<T>>;
/** Fetch every row in stable, bounded pages instead of silently stopping at the API row cap. */
export async function fetchAllPages<T>(fetchPage: PageFetcher<T>, pageSize = 500): Promise<PageResult<T>> {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 1000) throw new Error("Page size must be an integer between 1 and 1000.");
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const result = await fetchPage(from, from + pageSize - 1);
    if (result.error) return { data: null, error: result.error };
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return { data: rows, error: null };
  }
}
