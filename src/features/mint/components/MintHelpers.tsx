import { GatewaySession } from "@renproject/ren-tx";
import React, { FunctionComponent, useEffect } from "react";
import { BridgeChainConfig, CurrencyConfig } from "../../../utils/assetConfigs";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";
import { useMintMachine } from "../mintHooks";

export const mintTooltips = {
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
};

export const getMintDynamicTooltips = (
  chainConfig: BridgeChainConfig,
  chainNativeCurrencyConfig: CurrencyConfig
) => ({
  acknowledge: `Minting an asset on ${chainConfig.full} requires you to submit a transaction. It will cost you a small amount of ${chainNativeCurrencyConfig.short}.`,
});

type MintTransactionInitializerProps = {
  initialTx: GatewaySession;
  onCreated?: (tx: GatewaySession) => void;
};

export const MintTransactionInitializer: FunctionComponent<MintTransactionInitializerProps> = ({
  initialTx,
  onCreated,
}) => {
  const [current, , service] = useMintMachine(initialTx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );
  useEffect(() => {
    console.log(
      current.context.tx.gatewayAddress,
      !!current.context.tx.gatewayAddress
    );
    if (onCreated && !!current.context.tx.gatewayAddress) {
      onCreated(current.context.tx);
    }
  }, [onCreated, current.context.tx]);

  return null;
};

type AddressValidityMessageProps = { milliseconds: number };

export const AddressValidityMessage: FunctionComponent<AddressValidityMessageProps> = ({
  milliseconds,
}) => {
  return (
    <span>
      This Gateway Address is only valid for 24 hours, it expires in{" "}
      <HMSCountdown milliseconds={milliseconds} /> Do not send multiple deposits
      or deposit after it has expired.
    </span>
  );
};
