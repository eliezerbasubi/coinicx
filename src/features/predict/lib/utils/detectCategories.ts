import { PREDICTION_CATEGORIES } from "../constants/categories";

export const detectCategories = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase();
  const matchedCategories = Object.entries(PREDICTION_CATEGORIES)
    .filter(([_, keywords]) =>
      keywords.some((keyword) => text.includes(keyword)),
    )
    .map(([category]) => category);

  return matchedCategories.length ? matchedCategories : ["other"];
};
