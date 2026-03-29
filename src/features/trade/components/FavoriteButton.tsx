import { Star } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { useFavouriteStore } from "@/lib/store/trade/favourites";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  coin: string;
};

const FavoriteButton = ({ coin, className }: Props) => {
  const favourites = useFavouriteStore((s) => s.favourites);
  const haptic = useWebHaptics();

  const isFavourite = coin && favourites.includes(coin);

  return (
    <Star
      role="button"
      aria-label="Favorite"
      aria-pressed={isFavourite ? "true" : "false"}
      className={cn(
        "size-3 text-neutral-gray-400 outline-0 active:scale-95 transition-transform",
        className,
        {
          "fill-primary text-primary": isFavourite,
        },
      )}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          useFavouriteStore.getState().toggleFavourite(coin);
          haptic.trigger("medium");
        }
      }}
      onClick={(e) => {
        e.stopPropagation();

        if (coin) {
          useFavouriteStore.getState().toggleFavourite(coin);

          haptic.trigger("medium");
        } else {
          haptic.trigger("error");
        }
      }}
    />
  );
};

export default FavoriteButton;
