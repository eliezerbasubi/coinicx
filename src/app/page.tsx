import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

const AppPage = () => {
  return redirect(ROUTES.crypto.buy);
};

export default AppPage;
