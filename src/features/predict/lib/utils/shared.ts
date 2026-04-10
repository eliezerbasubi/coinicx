export function slugify(text: string): string {
  return encodeURIComponent(
    text.toLowerCase().replace(/\s/g, "-").replace(/\?/g, ""),
  );
}

export function encodeOutcomeURI(param: {
  question?: string;
  outcomeTitle: string;
  sideName: string;
}): string {
  return slugify(
    `${param.question ? `${param.question}-` : ""}${param.outcomeTitle}-${param.sideName}`,
  );
}
