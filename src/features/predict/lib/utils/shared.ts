/**
 * Converts a string to a URL-friendly slug.
 * It replaces spaces and question marks with hyphens and removes any other special characters.
 *
 * @param text The text to convert to a slug.
 * @returns The slugified text.
 */
export function slugify(text: string): string {
  return encodeURIComponent(
    text
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/\?/g, "")
      .replace(/[^a-zA-Z0-9-]/g, ""),
  );
}
