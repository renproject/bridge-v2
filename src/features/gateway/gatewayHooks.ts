import { Asset, Chain } from "@renproject/chains";
import RenJS, { Gateway, GatewayTransaction } from "@renproject/ren";
import { getInputAndOutputTypes } from "@renproject/ren/build/main/utils/inputAndOutputTypes";
import {
  ChainCommon,
  ContractChain,
  DepositChain,
  InputType,
  LogLevel,
  OutputType,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  MINT_GAS_UNIT_COST,
  RELEASE_GAS_UNIT_COST,
} from "../../constants/constants";
import { supportedContractChains } from "../../utils/chainsConfig";
import { fromGwei } from "../../utils/converters";
import { isDefined } from "../../utils/objects";
import { PartialChainInstanceMap } from "../chain/chainUtils";
import { $exchangeRates, $gasPrices } from "../marketData/marketDataSlice";
import {
  findAssetExchangeRate,
  findGasPrice,
} from "../marketData/marketDataUtils";
import { useChains, useCurrentNetworkChains } from "../network/networkHooks";
import { $network } from "../network/networkSlice";
import { LocalTxData } from "../storage/storageHooks";
import { createGateway } from "./gatewayUtils";

type UseGatewayCreateParams = {
  asset: Asset;
  from: Chain;
  to: Chain;
  amount?: string;
  toAddress?: string;
  nonce?: string | number;
};

type UseGatewayAdditionalParams = {
  chains: PartialChainInstanceMap | null;
  autoTeardown?: boolean;
  autoProviderAlteration?: boolean;
  initialGateway?: Gateway | null;
};

export type TxRecoverer = (
  txHash: string,
  localTxEntry: LocalTxData
) => Promise<void>;

export const useGateway = (
  { asset, from, to, nonce, toAddress, amount }: UseGatewayCreateParams,
  {
    autoTeardown = true,
    initialGateway = null,
    chains = null,
  }: UseGatewayAdditionalParams
) => {
  const { network } = useSelector($network);
  const [renJs, setRenJs] = useState<RenJS | null>(null);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState<Gateway | null>(initialGateway);
  const [transactions, setTransactions] = useState<Array<GatewayTransaction>>(
    []
  );
  const addTransaction = useCallback((newTx: GatewayTransaction) => {
    console.log("gateway detected tx:", newTx.hash, newTx);
    setTransactions((txs) => {
      const index = txs.findIndex((tx) => tx.hash === newTx.hash);
      if (index >= 0) {
        return txs.splice(index, 1, newTx);
      }
      return [...txs, newTx];
    });
  }, []);

  useEffect(() => {
    // setRenJs(null); // added
    console.log("gateway useEffect renJs and provider");
    if (!chains) {
      return;
    }
    const initProvider = async () => {
      const chainsArray = Object.values(chains).map((chain) => chain.chain);
      (window as any).chainsArray = chainsArray;
      const renJs = new RenJS(network, {
        logLevel: LogLevel.Debug,
      }).withChains(...chainsArray);
      (window as any).renJs = renJs;
      return renJs;
    };
    initProvider()
      .then((renJs) => setRenJs(renJs))
      .catch((error) => {
        console.error("gateway renJs error", error);
        setError(error);
      });
  }, [network, chains]);

  useEffect(() => {
    // setGateway(null); // added
    console.log("gateway useEffect gateway init");
    let newGateway: Gateway | null = null;
    if (renJs && chains !== null) {
      const initializeGateway = async () => {
        newGateway = await createGateway(
          renJs,
          { asset, from, to, nonce, toAddress, amount },
          chains
        );
        console.log("gateway created", newGateway);
        newGateway.on("transaction", addTransaction);
        console.log("gateway transaction listener added");
        (window as any).gateway = newGateway;
        return newGateway;
      };
      console.log("gateway initializing", chains);
      initializeGateway()
        .then((newGateway) => setGateway(newGateway))
        .catch((error) => {
          console.error(error);
          setError(error);
        });
    }

    return () => {
      if (newGateway && autoTeardown) {
        console.log("gateway removing listeners");
        newGateway.eventEmitter.removeListener("transaction", addTransaction);
      }
    };
  }, [
    chains,
    renJs,
    addTransaction,
    asset,
    from,
    to,
    nonce,
    toAddress,
    amount,
    autoTeardown,
  ]);

  const recoverLocalTx = useCallback<TxRecoverer>(
    async (txHash, localTxEntry) => {
      // tx.done?
      if (renJs !== null && gateway !== null) {
        console.log("tx: gateway transactions before", gateway.transactions);
        console.log("tx: recovering", localTxEntry);

        const tx = await renJs.gatewayTransaction(localTxEntry.params);
        console.log("tx: created", tx);
        // TODO: TBD: discuss with Noah
        gateway.transactions = gateway.transactions.set(txHash, tx);
        console.log("tx: gateway transactions after", gateway.transactions);
        // addTransaction(tx); will be handled automatically, emitter is required
        gateway.eventEmitter.emit("transaction", tx);
      } else {
        throw new Error("gateway not initialized");
      }
    },
    [gateway, renJs]
  );
  return { renJs, gateway, transactions, error, recoverLocalTx };
};

export const useAssetDecimals = (chain: Chain, asset: string | Asset) => {
  console.log("useAssetDecimals", chain, asset);
  const chains = useCurrentNetworkChains();
  const instance = chains[chain]?.chain;
  return useChainInstanceAssetDecimals(instance, asset);
};

const decimalsCache = new Map();
(window as any).decimalsCache = decimalsCache;

// TODO: rename to useChainInstanceAssetDecimals, reuse in useGatewayFees
export const useChainInstanceAssetDecimals = (
  chainInstance: ChainCommon | null | undefined,
  asset: string | Asset | null | undefined
) => {
  const cacheKey = chainInstance?.chain + "|" + asset;
  const cachedDecimals = decimalsCache.get(cacheKey);
  const [decimals, setDecimals] = useState<number | null>(
    cachedDecimals || null
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setDecimals(null);
    if (!chainInstance || !asset || cachedDecimals !== undefined) {
      return;
    }
    const getDecimals = async () => {
      return chainInstance.assetDecimals(asset);
    };
    getDecimals()
      .then((dec) => {
        decimalsCache.set(cacheKey, dec);
        setDecimals(dec);
      })
      .catch((err) => {
        setError(err);
      });
  }, [chainInstance, asset, cacheKey, cachedDecimals]);

  return { decimals: cachedDecimals || decimals, error };
};

export const useChainAssetAddress = (
  chainInstance: ContractChain | null,
  asset: string | Asset
) => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    if (!chainInstance) {
      setAddress(null);
      return;
    }
    const getAddress = async () => {
      if (!isDefined(chainInstance.getMintAsset)) {
        throw new Error(`Unable to resolve contract address for ${asset}`);
      }
      return (chainInstance as ContractChain).getMintAsset(asset);
    };
    getAddress()
      .then((addr) => {
        setAddress(addr);
      })
      .catch((err) => {
        setError(err);
      });
  }, [chainInstance, asset]);

  return { address, error };
};

export const useContractChainAssetBalance = (
  chainInstance: Chain | DepositChain | ContractChain | null | undefined,
  asset: string,
  address?: string
) => {
  const instance = chainInstance as ContractChain;
  const { decimals } = useChainInstanceAssetDecimals(instance, asset);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setError(null);
    setBalance(null);
    if (
      !instance ||
      decimals === null ||
      !supportedContractChains.includes(instance.chain as Chain)
    ) {
      return;
    }
    const getBalance = async () => {
      console.log(`asset balance ${instance?.chain}/${asset}: ${decimals}`);
      setBalance(null);
      const balanceBn = (
        await (instance as ContractChain).getBalance(asset, address || "")
      ).shiftedBy(-decimals);
      setBalance(balanceBn.toFixed());
      console.log(`gateway balance: ${balanceBn}`);
    };
    getBalance().catch((error) => {
      console.error(error);
      setError(error);
    });
  }, [instance, decimals, asset, address]);

  return { balance, error };
};

export const useGatewayFees = (
  gateway: Gateway | null,
  activeAmount: string | number | BigNumber | null = 0
) => {
  const gasPrices = useSelector($gasPrices);
  const asset = gateway?.params?.asset as Asset;
  const { isFromContractChain, isToContractChain, isMint, isRelease } =
    useDecomposedGatewayMeta(gateway);
  const { decimals: fromChainDecimals } = useChainInstanceAssetDecimals(
    gateway?.fromChain,
    asset
  );
  const { decimals: toChainDecimals } = useChainInstanceAssetDecimals(
    gateway?.toChain,
    asset
  );

  const [minimumAmount, setMinimumAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState<string | null>(null);
  const [variableFeePercent, setVariableFeePercent] = useState<number | null>(
    null
  );
  const [fixedFee, setFixedFee] = useState<number | null>(null);

  const [renVMFeePercent, setRenVMFeePercent] = useState<number | null>(null);
  const [renVMFeeAmount, setRenVMFeeAmount] = useState<string | null>(null);
  const [fromChainFeeAmount, setFromChainFeeAmount] = useState<string | null>(
    null
  );
  const [toChainFeeAmount, setToChainFeeAmount] = useState<string | null>(null);
  const [fromChainFeeAsset, setFromChainFeeAsset] = useState<Asset | null>(
    null
  );
  const [toChainFeeAsset, setToChainFeeAsset] = useState<Asset | null>(null);

  useEffect(() => {
    console.log(`gateway amounts effect`, gateway, activeAmount);
    if (!gateway || !fromChainDecimals || !toChainDecimals) {
      return;
    }
    // const isLock = gateway.inputType === InputType.Lock;
    // const isMint = gateway.outputType === OutputType.Mint;
    console.log("amount", activeAmount, isNaN(Number(activeAmount)));

    const renVMFee = gateway.fees.variableFee;
    setVariableFeePercent(
      new BigNumber(renVMFee).div(10000).multipliedBy(100).toNumber()
    );
    const renVMFeePercentBn = new BigNumber(renVMFee)
      .div(10000)
      .multipliedBy(100);
    setRenVMFeePercent(renVMFeePercentBn.toNumber());

    const minimumAmountBn = gateway.fees.minimumAmount.shiftedBy(
      -fromChainDecimals
    );
    setMinimumAmount(minimumAmountBn.toFixed());
    setFixedFee(gateway.fees.fixedFee.toNumber());

    const feeAssets = getNativeFeeAssets(gateway);
    setFromChainFeeAsset(feeAssets.fromChainFeeAsset);
    setToChainFeeAsset(feeAssets.toChainFeeAsset);

    const fromChainFeeBn = gateway.fees.fixedFee;
    if (isFromContractChain) {
      //gas fee
      const gasPrice = findGasPrice(gasPrices, gateway.params.from.chain);
      let feeInGwei = null;
      if (isMint) {
        feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrice * 1.18);
      } else if (isRelease) {
        feeInGwei = Math.ceil(RELEASE_GAS_UNIT_COST * gasPrice);
      }
      if (feeInGwei !== null) {
        setFromChainFeeAmount(fromGwei(feeInGwei).toString());
      }
    } else {
      setFromChainFeeAmount(
        fromChainFeeBn.shiftedBy(-fromChainDecimals).toFixed()
      );
    }

    const toChainFeeBn = gateway.fees.fixedFee;
    if (isToContractChain) {
      //gas fee
      const gasPrice = findGasPrice(gasPrices, gateway.params.to.chain);
      let feeInGwei = null;
      if (isMint) {
        feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrice * 1.18);
      } else if (isRelease) {
        feeInGwei = Math.ceil(RELEASE_GAS_UNIT_COST * gasPrice);
      }
      if (feeInGwei !== null) {
        setToChainFeeAmount(fromGwei(feeInGwei).toString());
      }
    } else {
      setToChainFeeAmount(toChainFeeBn.shiftedBy(-fromChainDecimals).toFixed());
    }

    if (
      activeAmount === "" ||
      activeAmount === null ||
      isNaN(Number(activeAmount))
    ) {
      setOutputAmount(null);
      setRenVMFeeAmount(null);
      return;
    }
    const amountBn = new BigNumber(activeAmount);

    const estimatedOutputBn = gateway.fees
      .estimateOutput(amountBn.shiftedBy(fromChainDecimals))
      .shiftedBy(-fromChainDecimals);
    setOutputAmount(estimatedOutputBn.toFixed());
    console.log(`gateway amount estimated output: ${estimatedOutputBn}`);

    const renVMFeeAmountBn = renVMFeePercentBn.div(100).multipliedBy(amountBn);
    setRenVMFeeAmount(renVMFeeAmountBn.toFixed());
  }, [
    gateway,
    fromChainDecimals,
    toChainDecimals,
    activeAmount,
    gasPrices,
    isFromContractChain,
    isMint,
    isRelease,
    isToContractChain,
  ]);

  return {
    decimals: fromChainDecimals,
    minimumAmount,
    outputAmount,
    variableFeePercent,
    fixedFee,
    renVMFeePercent,
    renVMFeeAmount,
    fromChainFeeAmount,
    fromChainFeeAsset,
    toChainFeeAmount,
    toChainFeeAsset,
    fees: gateway?.fees, // TODO: remove
  };
};

const getNativeFeeAssets = (gateway: Gateway) => {
  return {
    fromChainFeeAsset: gateway.fromChain.network.nativeAsset?.symbol as Asset,
    toChainFeeAsset: gateway.toChain.network.nativeAsset?.symbol as Asset,
  };
};

export const useGatewayFeesWithRates = (
  gateway: Gateway | null,
  activeAmount: string | number | BigNumber
) => {
  const rates = useSelector($exchangeRates);
  const fees = useGatewayFees(gateway, activeAmount);
  const [outputAmountUsd, setOutputAmountUsd] = useState<string | null>(null);
  const [activeAmountUsd, setActiveAmountUsd] = useState<string | null>(null);
  const [minimumAmountUsd, setMinimumAmountUsd] = useState<string | null>(null);
  const [renVMFeeAmountUsd, setRenVMFeeAmountUsd] = useState<string | null>(
    null
  );
  const [fromChainFeeAmountUsd, setFromChainFeeAmountUsd] = useState<
    string | null
  >(null);
  const [toChainFeeAmountUsd, setToChainFeeAmountUsd] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (gateway === null || !gateway?.params?.asset) {
      return;
    }
    const asset = gateway.params.asset as Asset;
    const assetUsdRate = findAssetExchangeRate(rates, asset);
    if (assetUsdRate === null) {
      return;
    }
    setActiveAmountUsd(
      fees.outputAmount !== null
        ? new BigNumber(activeAmount).multipliedBy(assetUsdRate).toFixed()
        : null
    );
    setOutputAmountUsd(
      fees.outputAmount !== null
        ? new BigNumber(fees.outputAmount).multipliedBy(assetUsdRate).toFixed()
        : null
    );
    setMinimumAmountUsd(
      new BigNumber(fees.minimumAmount).multipliedBy(assetUsdRate).toFixed()
    );
    setRenVMFeeAmountUsd(
      fees.renVMFeeAmount !== null
        ? new BigNumber(fees.renVMFeeAmount)
            .multipliedBy(assetUsdRate)
            .toFixed()
        : null
    );

    if (fees.fromChainFeeAsset !== null) {
      const fromChainAssetUsdRate = findAssetExchangeRate(
        rates,
        fees.fromChainFeeAsset
      );
      setFromChainFeeAmountUsd(
        fees.fromChainFeeAmount !== null && fromChainAssetUsdRate !== null
          ? new BigNumber(fees.fromChainFeeAmount)
              .multipliedBy(fromChainAssetUsdRate)
              .toFixed()
          : null
      );
    }
    if (fees.toChainFeeAsset !== null) {
      const toChainAssetUsdRate = findAssetExchangeRate(
        rates,
        fees.toChainFeeAsset
      );
      setToChainFeeAmountUsd(
        fees.toChainFeeAmount !== null && toChainAssetUsdRate !== null
          ? new BigNumber(fees.toChainFeeAmount)
              .multipliedBy(toChainAssetUsdRate)
              .toFixed()
          : null
      );
    }
  }, [gateway, activeAmount, fees, rates]);

  return {
    ...fees,
    outputAmountUsd,
    minimumAmountUsd,
    renVMFeeAmountUsd,
    fromChainFeeAmountUsd,
    toChainFeeAmountUsd,
    activeAmountUsd,
  };
};

export const getGatewayParams = (gateway: Gateway) => {
  const asset = gateway.params.asset as Asset;
  const from = gateway.params.from.chain as Chain;
  const to = gateway.params.to.chain as Chain;
  const fromAmount = gateway.params.from.params?.amount as string;
  const toAddress = gateway.params.to.params?.address as string;
  const fromAverageConfirmationTime =
    gateway.fromChain.network.averageConfirmationTime;
  const toAverageConfirmationTime =
    gateway.toChain.network.averageConfirmationTime;
  return {
    asset,
    from,
    to,
    amount: fromAmount || 0,
    fromAmount,
    toAddress,
    fromAverageConfirmationTime,
    toAverageConfirmationTime,
  };
};

//will become  useGatewayMeta
export const useDecomposedGatewayMeta = (gateway: Gateway | null) => {
  const asset = gateway?.params.asset || null;
  const from = gateway?.params.from.chain || null;
  const to = gateway?.params.to.chain || null;
  return useGatewayMeta(asset, from, to);
};

// TODO: memoize?
//will become useGatewayParamsMeta
export const useGatewayMeta = (
  asset: Asset | string | null,
  from: Chain | null,
  to: Chain | null
) => {
  const { network } = useSelector($network);
  const chains = useChains(network);

  const [isMint, setIsMint] = useState<boolean | null>(null);
  const [isRelease, setIsRelease] = useState<boolean | null>(null);
  const [isLock, setIsLock] = useState<boolean | null>(null);
  const [isBurn, setIsBurn] = useState<boolean | null>(null);
  const [isFromContractChain, setIsFromContractChain] =
    useState<boolean>(false);
  const [isToContractChain, setIsToContractChain] = useState<boolean>(false);

  const reset = useCallback(() => {
    setIsMint(null);
    setIsRelease(null);
    setIsLock(null);
    setIsBurn(null);
    setIsFromContractChain(false);
    setIsToContractChain(false);
  }, []);

  useEffect(() => {
    reset();
    console.log(asset, from, to);
    if (asset === null || from === null || to === null) {
      return;
    }
    setIsToContractChain(Boolean(chains[to]?.connectionRequired));
    setIsFromContractChain(Boolean(chains[from]?.connectionRequired));

    getInputAndOutputTypes({
      asset,
      fromChain: chains[from]?.chain,
      toChain: chains[to]?.chain,
    })
      .then(({ inputType, outputType, selector }) => {
        console.log(inputType, outputType);
        if (inputType === InputType.Burn) {
          setIsBurn(true);
          setIsLock(false);
        } else if (inputType === InputType.Lock) {
          setIsLock(true);
          setIsBurn(false);
        }
        if (outputType === OutputType.Mint) {
          setIsMint(true);
          setIsRelease(false);
        } else if (outputType === OutputType.Release) {
          setIsRelease(true);
          setIsMint(false);
        }
      })
      .catch((error) => {
        console.log(asset, from, to);
        console.error(error);
        reset();
      });
  }, [reset, chains, asset, from, to]);
  // console.log("useGatewayMeta", asset, from, to, chains);

  // this is faster than input/output types
  // const fromConnectionRequired = Boolean(chains[from].connectionRequired);
  // const toConnectionRequired = Boolean(chains[to].connectionRequired);

  return {
    isMint,
    isRelease,
    isLock,
    isBurn,
    // handle nulls
    isFromContractChain,
    isToContractChain,
    isH2H: isFromContractChain && isToContractChain,
  };
};

export const useAddressValidator = (chain: Chain) => {
  const chains = useCurrentNetworkChains();
  const instance = chains[chain].chain;
  const validateAddress = useMemo(() => {
    return (address: string) => {
      try {
        return instance.validateAddress(address || "");
      } catch (e: any) {
        return false;
      }
    };
  }, [instance]);
  (window as any).validator = validateAddress;
  return { validateAddress };
};
