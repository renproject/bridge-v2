import { GatewaySession } from "@renproject/rentx";
import { FunctionComponent, useEffect } from "react";
import { toPercent } from "../../../utils/converters";
import { useMintMachine } from "../mintUtils";

export const mintTooltips = {
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
  acknowledge:
    "Minting an asset on Ethereum requires you to submit a transaction. It will cost you a small amount of ETH.",
};

export const getFeeTooltips = (mintFee: number, releaseFee: number) => ({
  renVmFee: `RenVM takes a ${toPercent(
    mintFee
  )}% fee per mint transaction and ${toPercent(
    releaseFee
  )}% per burn transaction. This is shared evenly between all active nodes in the decentralized network.`,
  bitcoinMinerFee:
    "The fee required by BTC miners, to move BTC. This does not go RenVM or the Ren team.",
  estimatedEthFee:
    "The estimated cost to perform a transaction on the Ethereum network. This fee goes to Ethereum miners and is paid in ETH.",
});

type MintTransactionInitializerProps = {
  initialTx: GatewaySession;
  onCreated?: (tx: GatewaySession) => void;
};

export const MintTransactionInitializer: FunctionComponent<MintTransactionInitializerProps> = ({
  initialTx,
  onCreated,
}) => {
  const [current] = useMintMachine(initialTx);

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
