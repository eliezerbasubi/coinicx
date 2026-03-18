import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import { DEFAULT_PERPS_ASSETS } from "@/features/trade/constants";

const AppPage = () => {
  return redirect(`${ROUTES.trade.perps}/${DEFAULT_PERPS_ASSETS.base}`);
};

export default AppPage;
