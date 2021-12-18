import { Asset, Chain } from "@renproject/chains";
import { Ethereum } from "@renproject/chains-ethereum";
import RenJS, { Gateway, GatewayTransaction } from "@renproject/ren";
import { RenNetwork } from "@renproject/utils";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { alterEthereumBaseChainSigner } from "../chain/chainUtils";
import { useChains } from "../network/networkHooks";
import { useWallet } from "../wallet/walletHooks";
import { createGateway } from "./gatewayUtils";

type UseGatewayParams = {
  network: RenNetwork;
  asset: Asset;
  from: Chain;
  to: Chain;
  amount?: string;
  nonce?: number;
};

export const useGateway = ({
  asset,
  from,
  to,
  amount,
  network,
  nonce,
}: UseGatewayParams) => {
  const chains = useChains(network);
  const { provider } = useWallet(to);
  const [renJs, setRenJs] = useState<RenJS | null>(null);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [transactions, setTransactions] = useState<Array<GatewayTransaction>>(
    []
  );
  const addTransaction = useCallback((tx: GatewayTransaction) => {
    console.log("gateway detected transaction", tx);
    setTransactions((txs) => [...txs, tx]);
  }, []);

  // set up renjs with signers
  useEffect(() => {
    console.log("useGateway useEffect renJs and provider");
    const initProvider = async () => {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      console.log("useGateway altering signer");
      alterEthereumBaseChainSigner(chains, signer);
      const renJs = new RenJS(network).withChains(
        // @ts-ignore
        ...Object.values(chains).map((chain) => chain.chain)
      );
      (window as any).renJs = renJs;
      return renJs;
    };
    initProvider()
      .then((renJs) => setRenJs(renJs))
      .catch((error) => {
        setError(error);
      });
  }, [network]);

  // initialize gateway
  useEffect(() => {
    console.log("useGateway useEffect gateway init");
    if (renJs) {
      const initializeGateway = async () => {
        const gateway = await createGateway(
          renJs,
          { asset, from, to, amount, nonce },
          chains
        );
        console.log("gateway created", gateway);
        gateway.on("transaction", addTransaction);
        console.log("gateway transaction listener added");
        (window as any).gateway = gateway;
        return gateway;
      };
      console.log("gateway initializing");
      initializeGateway()
        .then((gateway) => setGateway(gateway))
        .catch((error) => {
          setError(error);
        });
    }

    return () => {
      if (gateway) {
        console.log("gateway removing listeners");
        gateway.eventEmitter.removeAllListeners();
      }
    };
  }, [renJs]);

  return { renJs, gateway, transactions, error };
};

export const useGatewayFees = (
  gateway: Gateway | null,
  amount: string | number | BigNumber
) => {
  const [decimals, setDecimals] = useState(0);
  const [balance, setBalance] = useState("");
  const [balancePending, setBalancePending] = useState(false);
  const [minimumAmount, setMinimumAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [amountsPending, setAmountsPending] = useState(false);

  useEffect(() => {
    setBalancePending(true);
    if (!gateway) {
      return;
    }
    const getFees = async () => {
      const decimals = await gateway.fromChain.assetDecimals(
        gateway.params.asset
      );
      setDecimals(decimals);
      console.log(
        `gateway decimals ${gateway.fromChain.chain}/${gateway.params.asset}: ${decimals}`
      );

      const balanceBn = (
        await (gateway.toChain as Ethereum).getBalance(gateway.params.asset)
      ).shiftedBy(-decimals);
      setBalance(balanceBn.toFixed());
      console.log(`gateway balance: ${balanceBn}`);
      setBalancePending(false);
    };
    getFees().catch(console.error);
  }, [gateway]);

  useEffect(() => {
    console.log(`gateway amounts effect`, gateway, amount);
    setAmountsPending(true);
    if (!gateway || !decimals) {
      return;
    }
    const estimatedOutputBn = gateway.fees
      // @ts-ignore
      .estimateOutput(new BigNumber(amount).shiftedBy(decimals))
      .shiftedBy(-decimals);
    setOutputAmount(estimatedOutputBn.toFixed());
    console.log(`gateway amount estimated output: ${estimatedOutputBn}`);

    const minimumAmountBn = gateway.fees.minimumAmount.shiftedBy(-decimals);
    setMinimumAmount(minimumAmountBn.toFixed());
    console.log(`gateway amount minimum: ${minimumAmountBn}`);
    setAmountsPending(false);
  }, [gateway, decimals, amount]);

  return {
    decimals,
    balance,
    balancePending,
    minimumAmount,
    outputAmount,
    amountsPending,
  };
};
