const TradingLoading = () => {
  return (
    <div className="w-full">
      <div className="bg-trade-dark w-full flex gap-1 md:gap-0 xl:gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        <div className="w-full space-y-1">
          {/* TickerOverview */}
          <div className="w-full h-35.5 md:h-20 bg-primary-dark md:rounded-l-md xl:rounded-md" />

          <div className="flex gap-1 md:flex-wrap-reverse lg:flex-nowrap">
            {/* Orderbook */}
            <div className="hidden md:block w-full lg:max-w-65 xl:max-w-80 md:h-67 lg:h-auto bg-primary-dark rounded-md" />

            {/* TradeChartArea */}
            <div className="w-full xl:flex-1 bg-primary-dark md:rounded-md h-96 lg:h-125" />
          </div>
        </div>

        {/* OrderForm */}
        <div className="w-full max-w-80 lg:max-w-65 xl:max-w-80 hidden md:flex flex-col gap-y-1">
          {/* A fake div to show that the ticker is full width - only visible in table */}
          {/* Hide the edges by adding and removing one pixel */}
          <div className="w-[calc(100%+1px)] -ml-px h-20 hidden md:block xl:hidden bg-primary-dark rounded-r-md" />

          {/* Real OrderForm */}
          {/* Add 1px padding left to push the orderbook form  */}
          <div className="w-full flex-1 md:pl-1 xl:pl-0">
            <div className="size-full bg-primary-dark md:rounded-md" />
          </div>
        </div>
      </div>

      <div className="w-full bg-trade-dark flex gap-1 py-0.5 md:px-1 md:pb-2 md:pt-0 flex-wrap md:flex-nowrap">
        {/* TradeUserInfo */}
        <div className="w-full h-85 bg-primary-dark md:rounded-md" />

        {/* UserAccountInfo */}
        <div className="w-full max-w-80 md:max-w-79 lg:max-w-64.5 xl:max-w-80 bg-primary-dark rounded-md" />
      </div>
    </div>
  );
};

export default TradingLoading;
