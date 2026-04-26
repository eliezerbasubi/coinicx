import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks whether the target element (e.g. MarketEventHeader) has scrolled
 * out of view using the IntersectionObserver API.
 *
 * @param root - The scrollable container to observe within.
 * @returns `headerRef` to attach to the observed element, and `isHeaderHidden`
 * indicating whether it has left the viewport.
 */
const useHeaderVisibility = (root: Element | null) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  const handleIntersection = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      // The header is considered hidden when it's no longer intersecting.
      setIsHeaderHidden(!entry.isIntersecting);
    },
    [],
  );

  useEffect(() => {
    const target = headerRef.current;

    if (!target || !root) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      // Trigger slightly before the header fully disappears so the
      // transition feels connected to the scroll.
      rootMargin: "-48px 0px 0px 0px",
      threshold: 0,
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [root, handleIntersection]);

  return { headerRef, isHeaderHidden };
};

export default useHeaderVisibility;
