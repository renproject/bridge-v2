import { GatewaySession } from '@renproject/rentx'
import { FunctionComponent, useEffect } from 'react'
import { useMintMachine } from '../mintUtils'

export const mintTooltips = {
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
  acknowledge:
    "Minting an asset on Ethereum requires you to submit a transaction. It will cost you a small amount of ETH.",
};

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
