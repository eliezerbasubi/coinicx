import React from "react";

import Web3Provider from "./Web3Provider";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return <Web3Provider>{children}</Web3Provider>;
};

export default Providers;
