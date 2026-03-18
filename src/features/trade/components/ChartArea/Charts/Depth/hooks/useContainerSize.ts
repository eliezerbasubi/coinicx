import { RefObject, useEffect, useState } from "react";

import { debounce } from "@/lib/utils/debounce";

export const useContainerSize = (ref: RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = debounce(() => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    }, 100);

    // Initial measurement
    const rect = element.getBoundingClientRect();
    setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
};
