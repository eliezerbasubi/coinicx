import { redirect } from "next/navigation";

import { defaultSpotAsset } from "@/components/trade/constants";
import { ROUTES } from "@/constants/routes";

const TradePage = () => {
  redirect(
    `${ROUTES.trade.spot}/${defaultSpotAsset.baseAsset}/${defaultSpotAsset.quoteAsset}`,
  );
};

export default TradePage;
