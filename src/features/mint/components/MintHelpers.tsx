import React, { FunctionComponent } from "react";
import { styled } from "@material-ui/core";
import { BridgeChainConfig, CurrencyConfig } from "../../../utils/assetConfigs";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";

export const mintTooltips = {
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
  recipientAddress: "The wallet that will receive the minted assets.",
};

export const getMintDynamicTooltips = (
  chainConfig: BridgeChainConfig,
  chainNativeCurrencyConfig: CurrencyConfig
) => ({
  acknowledge: `Minting an asset on ${chainConfig.full} requires you to submit a transaction. It will cost you a small amount of ${chainNativeCurrencyConfig.short}.`,
});

export const DepositWrapper = styled("div")({
  position: "relative",
});

type AddressValidityMessageProps = { milliseconds: number };

export const AddressValidityMessage: FunctionComponent<AddressValidityMessageProps> = ({
  milliseconds,
}) => {
  return (
    <span>
      This Gateway Address is only valid for 24 hours, it expires in{" "}
      <HMSCountdown milliseconds={milliseconds} />. Do not send multiple
      deposits or deposit after it has expired.
    </span>
  );
};

export const MultipleDepositsMessage: FunctionComponent = () => {
  return (
    <span>
      RenBridge has detected another deposit to the same gateway address. It
      will require an additional submission to to the destination chain via your
      web3 wallet.
    </span>
  );
};
