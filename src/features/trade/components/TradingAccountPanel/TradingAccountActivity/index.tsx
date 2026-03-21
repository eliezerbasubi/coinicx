import { useTradingAccountActivity } from "@/features/trade/hooks/useTradingAccountActivity";

import TradingAccountDataTable from "./TradingAccountDataTable";

const TradingAccountActivity = () => {
  const { data, status } = useTradingAccountActivity();

  return <TradingAccountDataTable data={data} loading={status === "pending"} />;
};

export default TradingAccountActivity;
