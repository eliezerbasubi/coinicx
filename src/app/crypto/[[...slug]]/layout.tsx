import React from "react";
import { redirect } from "next/navigation";

import { getCryptoPathParams } from "@/components/Crypto/utils/getCryptoPathParams";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const BuySellCryptoLayout = async ({
  params,
  children,
}: React.PropsWithChildren<Props>) => {
  const { slug } = await params;

  const pathParams = getCryptoPathParams(slug);

  if (pathParams.redirect)
    redirect(
      `${pathParams.marketType}/${pathParams.fiat}/${pathParams.crypto}`,
    );

  return <div className="w-full">{children}</div>;
};

export default BuySellCryptoLayout;
