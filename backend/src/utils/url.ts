export function uniqueNormalizedUrls(urls: string[]): string[] {
  const clean = urls.map((url) => url.trim());
  return Array.from(new Set(clean));
}
