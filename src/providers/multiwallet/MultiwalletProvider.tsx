import { MultiwalletProvider as RenMultiwalletProvider } from "@renproject/multiwallet-ui";
import React, { FunctionComponent } from "react";

export const MultiwalletProvider: FunctionComponent = ({ children }) => {
  return <RenMultiwalletProvider>{children}</RenMultiwalletProvider>;
};
