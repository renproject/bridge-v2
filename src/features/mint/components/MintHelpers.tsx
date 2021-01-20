import { styled } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, { FunctionComponent, useEffect } from "react";
import { Link } from "../../../components/links/Links";
import { BridgeChainConfig, CurrencyConfig } from "../../../utils/assetConfigs";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";
import { useMintMachine } from "../mintHooks";

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

type MintTransactionInitializerProps = {
  initialTx: GatewaySession;
  onCreated?: (tx: GatewaySession) => void;
};

export const DepositWrapper = styled("div")({
  position: "relative",
  border: "1px solid lightblue",
  // zIndex: 0
});

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
      <HMSCountdown milliseconds={milliseconds} />. Do not send multiple
      deposits or deposit after it has expired.
    </span>
  );
};

type MultipleDepositsMessageProps = {
  total: number;
  onLinkClick: () => void;
};

export const MultipleDepositsMessage: FunctionComponent<MultipleDepositsMessageProps> = ({
  total,
  onLinkClick,
}) => {
  return (
    <span>
      RenBridge has detected {total} deposits to the same gateway address.
      You'll need to submit {total > 2 ? "all of them" : "both"} to the
      destination chain via your web3 wallet.
      <br />
      <Link external onClick={onLinkClick}>
        View Transaction
      </Link>
    </span>
  );
};
