import { useMediaQuery } from "usehooks-ts";

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

export const useIsMobile = (options?: UseMediaQueryOptions) => {
  const isMobile = useMediaQuery("(max-width: 767px)", options);

  return isMobile;
};

export const useIsDesktop = (options?: UseMediaQueryOptions) => {
  const isDesktop = useMediaQuery("(min-width: 768px)", options);

  return isDesktop;
};

export const useIsTablet = (options?: UseMediaQueryOptions) => {
  const isTablet = useMediaQuery(
    "(min-width: 768px) and (max-width: 1024px)",
    options,
  );

  return isTablet;
};

export const useIsLaptop = (options?: UseMediaQueryOptions) => {
  const isLaptop = useMediaQuery("(min-width: 1025px)", options);

  return isLaptop;
};
