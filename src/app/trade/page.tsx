import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

const TradePage = () => {
  redirect(`${ROUTES.trade.spot}/BTC/USDT`);
};

export default TradePage;
