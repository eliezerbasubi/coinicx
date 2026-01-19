import { useMediaQuery } from "usehooks-ts";

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

export const useIsMobile = (options?: UseMediaQueryOptions) => {
  const isMobile = useMediaQuery("(max-width: 768px)", options);

  return isMobile;
};
