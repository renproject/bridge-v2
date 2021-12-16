import { Asset, Chain } from "@renproject/chains";
import RenJS, { Gateway, GatewayTransaction } from "@renproject/ren";
import { RenNetwork } from "@renproject/utils";
import { useCallback, useEffect, useState } from "react";
import { ChainInstanceMap } from "../chain/chainUtils";
import { createGateway } from "./gatewayUtils";

type UseGatewayParams = {
  network: RenNetwork;
  asset: Asset;
  fromChain: Chain;
  toChain: Chain;
  amount?: string;
  nonce?: number;
};

export const useGateway = (
  { asset, fromChain, toChain, amount, network, nonce }: UseGatewayParams,
  renJs: RenJS | null,
  chains: ChainInstanceMap
) => {
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [transactions, setTransactions] = useState<Array<GatewayTransaction>>(
    []
  );
  const addTransaction = useCallback((tx: GatewayTransaction) => {
    console.log("gateway detected transaction", tx);
    setTransactions((txs) => [...txs, tx]);
  }, []);

  useEffect(() => {
    console.log("useGateway useEffect");
    if (renJs) {
      console.log("initializeGateway");
      const initializeGateway = async () => {
        const gateway = await createGateway(
          renJs,
          { asset, from: fromChain, to: toChain, amount, nonce },
          chains
        );
        console.log("gateway created", gateway);
        gateway.on("transaction", addTransaction);
        console.log("gateway transaction listener registered", addTransaction);
        (window as any).g = gateway;
        return gateway;
      };
      initializeGateway()
        .then((gateway) => setGateway(gateway))
        .catch(console.error);
    }

    return () => {
      if (gateway) {
        gateway.eventEmitter.removeAllListeners();
      }
    };
  }, [renJs]); // of useEffect

  return { gateway, transactions };
};
