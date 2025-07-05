import React from "react";

import TransactCrypto from "@/components/Crypto";
import CryptoMarketProvider from "@/components/Crypto/provider";
import { getCryptoPathParams } from "@/components/Crypto/utils/getCryptoPathParams";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const BuySellCryptoPage = async ({ params }: Props) => {
  const { slug } = await params;
  const pathParams = getCryptoPathParams(slug);

  return (
    <CryptoMarketProvider
      marketType={pathParams.marketType}
      fiatAssetCode={pathParams.fiat}
      cryptoAssetCode={pathParams.crypto}
    >
      <TransactCrypto />
    </CryptoMarketProvider>
  );
};

export default BuySellCryptoPage;
