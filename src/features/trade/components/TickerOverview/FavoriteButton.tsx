import { Star } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { cn } from "@/lib/utils/cn";

import { useFavoriteStore } from "./store";

type Props = {
  className?: string;
  coin: string;
};

const FavoriteButton = ({ coin, className }: Props) => {
  const { favourites, toggleFavourite } = useFavoriteStore();
  const haptic = useWebHaptics();

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

        haptic.trigger("medium");
      }}
    />
  );
};

export default FavoriteButton;
