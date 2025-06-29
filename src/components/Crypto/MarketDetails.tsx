import React from "react";

type Props = {};

const MarketDetails = (props: Props) => {
  return (
    <div className="w-full">
      <div className="w-full">
        <p className="font-bold text-2xl my-4">Markets</p>
        <div className="w-full grid md:grid-cols-3 gap-4">
          <MarketDetailItem title="Popularity" details={"#5"} />
          <MarketDetailItem title="Market Cap" details={"$5.56M"} />
          <MarketDetailItem title="Circulating Supply" details={"345M"} />
          <MarketDetailItem title="Volume" details={"5M"} />
        </div>
      </div>
      <div className="w-full">
        <p className="font-bold text-2xl my-4">Conversion Tables</p>
        <div className="w-full grid md:grid-cols-3 gap-4">
          <MarketDetailItem title="7 days exchange rate" details={"+0.45%"} />
          <MarketDetailItem title="24-hour exchange rate" details={"+0.45%"} />
          <MarketDetailItem title="1 month exchange rate" details={"-3.56%"} />
          <MarketDetailItem title="3 month exchange rate" details={"+1.2%"} />
        </div>
      </div>
    </div>
  );
};

type MarketDetailItemProps = {
  title: string;
  details: React.ReactNode;
};

const MarketDetailItem = ({ title, details }: MarketDetailItemProps) => {
  return (
    <div className="bg-neutral-gray-200 rounded-lg p-3">
      <p className="text-sm text-neutral-gray-400 font-medium">{title}</p>

      <div className="font-bold mt-1">{details}</div>
    </div>
  );
};

export default MarketDetails;
