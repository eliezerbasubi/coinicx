// export default function Home() {
//   return <p>Home</p>;
// }

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

type Props = {};

const AppPage = (props: Props) => {
  return redirect(ROUTES.crypto.buy);
};

export default AppPage;
