import { redirect } from "next/navigation";

import CryptoMarketProvider from "@/features/crypto/provider";
import { getCryptoPathParams } from "@/features/crypto/utils/getCryptoPathParams";

const BuySellCryptoLayout = async ({
  params,
  children,
}: LayoutProps<"/crypto/[[...slug]]">) => {
  const { slug } = await params;

  const pathParams = getCryptoPathParams(slug);

  if (pathParams.redirect) {
    redirect(
      `${pathParams.marketType}/${pathParams.fiat}/${pathParams.crypto}`,
    );
  }

  return (
    <CryptoMarketProvider
      marketType={pathParams.marketType}
      fiatAssetCode={pathParams.fiat}
      cryptoAssetCode={pathParams.crypto}
    >
      {children}
    </CryptoMarketProvider>
  );
};

export default BuySellCryptoLayout;
