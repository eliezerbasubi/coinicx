import { DependencyList, useCallback, useEffect, useRef } from "react";
import { ISubscription } from "@nktkas/hyperliquid";

export const useSubscription = (
  subscribe: () => Promise<ISubscription> | ISubscription | undefined,
  deps: DependencyList,
) => {
  const subscriptionRef = useRef<ISubscription | null>(null);

  const subFn = useCallback(() => {
    let cancelled = false;

    // cleanup old subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    try {
      const maybeSub = subscribe();

      if (maybeSub instanceof Promise) {
        maybeSub
          .then((sub) => {
            if (!cancelled && sub) {
              subscriptionRef.current = sub;
            } else {
              sub?.unsubscribe?.(); // unsubscribe if it resolved too late
            }
          })
          .catch((err) => {
            console.error("Subscription failed:", err);
          });
      } else if (maybeSub) {
        subscriptionRef.current = maybeSub;
      }
    } catch (err) {
      console.error("Subscription error:", err);
    }

    return () => {
      cancelled = true;
    };
  }, deps);

  useEffect(() => {
    const cancel = subFn();

    return () => {
      cancel?.();
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [subFn]);

  return subscriptionRef;
};

export const useSubscriptions = (
  subscribes: Array<() => Promise<ISubscription> | ISubscription | undefined>,
  deps: React.DependencyList,
) => {
  const subsRef = useRef<Set<ISubscription>>(new Set());

  const subFn = useCallback(() => {
    let cancelled = false;

    // cleanup old subscriptions
    subsRef.current.forEach((sub) => sub.unsubscribe());
    subsRef.current.clear();

    // iterate over subscribe functions
    subscribes.forEach((subscribe) => {
      try {
        const maybeSub = subscribe();

        if (maybeSub instanceof Promise) {
          maybeSub
            .then((sub) => {
              if (!cancelled && sub) {
                subsRef.current.add(sub);
              } else {
                sub?.unsubscribe?.();
              }
            })
            .catch((err) => {
              console.error("Subscription failed:", err);
            });
        } else if (maybeSub) {
          subsRef.current.add(maybeSub);
        }
      } catch (err) {
        console.error("Subscription error:", err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, deps);

  useEffect(() => {
    const cancel = subFn();
    const subs = subsRef.current;

    return () => {
      cancel?.();
      subs.forEach((sub) => sub.unsubscribe());
      subs.clear();
    };
  }, [subFn]);

  return subsRef;
};
