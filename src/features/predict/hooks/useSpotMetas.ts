import { NotifyOnChangeProps, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { SpotMetas } from "@/lib/types/trade";
import { mapDataToSpotMetas } from "@/features/trade/utils";

type UseSpotMetasArgs = {
  enabled?: boolean;
  notifyOnChangeProps?: NotifyOnChangeProps;
};

export const useSpotMetas = (args?: UseSpotMetasArgs) => {
  const { data: spotMetas } = useQuery({
    queryKey: [QUERY_KEYS.spotMeta],
    staleTime: Infinity,
    notifyOnChangeProps: args?.notifyOnChangeProps,
    enabled: args?.enabled,
    queryFn: async (): Promise<SpotMetas> => {
      const spotMeta = await hlInfoClient.spotMeta();

      return mapDataToSpotMetas(spotMeta);
    },
  });

  return spotMetas;
};
