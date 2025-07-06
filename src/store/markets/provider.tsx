import React, { useEffect, useRef } from "react";

import {
  createCryptoMarketStore,
  CryptoMarketContext,
  CryptoMarketProps,
  CryptoMarketStore,
} from "./store";

const CryptoMarketStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<CryptoMarketProps>) => {
  const storeRef = useRef<CryptoMarketStore>(null);
  if (!storeRef.current) {
    storeRef.current = createCryptoMarketStore(props);
  }

  useEffect(() => {
    storeRef.current?.setState({
      selectedAssets: props.selectedAssets,
      isLoadingAssets: props.isLoadingAssets,
      marketAssets: props.marketAssets,
    });
  }, [props.selectedAssets, props.isLoadingAssets, props.marketAssets]);

  return (
    <CryptoMarketContext.Provider value={storeRef.current}>
      {children}
    </CryptoMarketContext.Provider>
  );
};

export default CryptoMarketStoreProvider;
