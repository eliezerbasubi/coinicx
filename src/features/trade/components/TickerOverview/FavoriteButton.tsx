import React from "react";
import { Star } from "lucide-react";

import { cn } from "@/utils/cn";

import { useFavoriteStore } from "./store";

type Props = {
  className?: string;
  coin: string;
};

const FavoriteButton = ({ coin, className }: Props) => {
  const { favourites, toggleFavourite } = useFavoriteStore();

  const isFavourite = favourites.includes(coin);

  return (
    <Star
      role="button"
      className={cn(
        "size-3 text-neutral-gray-400",
        {
          "fill-primary text-primary": isFavourite,
        },
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavourite(coin);
      }}
    />
  );
};

export default FavoriteButton;
