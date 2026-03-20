import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import { DEFAULT_SPOT_ASSETS } from "@/features/trade/constants";
import TradingPairProvider from "@/features/trade/providers/trading-pair-provider";
import { getTradePathParams } from "@/features/trade/utils/getTradePathParams";

const TradeLayout = async ({
  params,
  children,
}: LayoutProps<"/trade/[[...slug]]">) => {
  const { slug } = await params;

  const pathParams = getTradePathParams(slug);

  if (pathParams.redirect) {
    let path = `${ROUTES.trade.index}/${pathParams.type}/${pathParams.base}`;
    if (pathParams.quote) {
      path += `/${pathParams.quote}`;
    }
    redirect(path);
  }

  return (
    <TradingPairProvider
      instrumentType={pathParams.type}
      base={pathParams.base}
      quote={pathParams.quote ?? DEFAULT_SPOT_ASSETS.quote}
    >
      {children}
    </TradingPairProvider>
  );
};

export default TradeLayout;
