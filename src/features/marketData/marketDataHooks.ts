import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInterval } from "react-use";
import { fetchWithTimeout } from "../../utils/fetch";
import { useReportSystemStatus } from "../ui/uiHooks";
import { SystemStatus, SystemType } from "../ui/uiSlice";
import {
  $exchangeRates,
  setExchangeRates,
  setGasPrices,
} from "./marketDataSlice";
import {
  CoingeckoReferenceData,
  coingeckoSymbols,
  findAssetExchangeRate,
  GasPrice,
  mapCoingeckoToExchangeRate,
} from "./marketDataUtils";

const dataRefreshInterval = 30; // seconds

const fetchCoingeckoExchangeRates = async () => {
  return fetch(
    "https://api.coingecko.com/api/v3" +
      `/coins/markets?vs_currency=usd&ids=${coingeckoSymbols.join(",")}`
  ).then((response) => response.json());
};

export const useExchangeRates = () => {
  const dispatch = useDispatch();
  const report = useReportSystemStatus();
  const fetchData = useCallback(() => {
    // fetchBandchainExchangeRates()
    //   .then((data: Array<BandchainReferenceData>) => {
    //     report(SystemType.Bandchain, SystemStatus.Operational);
    //     const rates = mapBandchainToExchangeRate(data);
    //     dispatch(updateExchangeRates(rates));
    //   })
    //   .catch((error: any) => {
    //     report(SystemType.Bandchain, SystemStatus.Failure);
    //     console.error(error);
    //   });

    fetchCoingeckoExchangeRates()
      .then((data: Array<CoingeckoReferenceData>) => {
        report(SystemType.Coingecko, SystemStatus.Operational);
        const rates = mapCoingeckoToExchangeRate(data);
        dispatch(setExchangeRates(rates));
      })
      .catch((error: any) => {
        report(SystemType.Coingecko, SystemStatus.Failure);
        console.error(error);
      });
  }, [dispatch, report]);

  useEffect(fetchData, [fetchData]);
  useInterval(fetchData, dataRefreshInterval * 1000);
};

export const useGasPrices = () => {
  const dispatch = useDispatch();
  const report = useReportSystemStatus();

  const fetchData = useCallback(async () => {
    const anyBlockEth = await fetchWithTimeout(
      "https://api.anyblock.tools/ethereum/ethereum/mainnet/gasprice"
    )
      .then((response) => {
        report(SystemType.Anyblock, SystemStatus.Operational);
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        report(SystemType.Anyblock, SystemStatus.Failure);
        return {
          fast: 50, // fallback
        };
      });
    const fast = anyBlockEth.fast;
    const ethPrice = {
      chain: Chain.Ethereum,
      standard: fast < 20 ? 50 : fast,
    };
    const matic = await fetchWithTimeout(
      "https://gasstation-mainnet.matic.network"
    )
      .then((response) => {
        report(SystemType.MaticGasStation, SystemStatus.Operational);
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        report(SystemType.MaticGasStation, SystemStatus.Failure);
        return {
          fast: 6, // fallback
        };
      });
    const maticPrice = {
      chain: Chain.Polygon,
      standard: matic.fast,
    };
    const bscPrice = {
      chain: Chain.BinanceSmartChain,
      standard: 20, // unable to find reliable source, but binance gas price is stable
    };
    const avaxPrice = {
      chain: Chain.Avalanche,
      standard: 225, // taken from https://docs.avax.network/learn/platform-overview/transaction-fees#fee-schedule
    };
    const ftmPrice = {
      chain: Chain.Fantom,
      standard: 75, // avg gas price
    };
    const arbPrice = {
      chain: Chain.Arbitrum,
      standard: 0.4, // avg gas price
    };
    const solanaPrice = {
      chain: Chain.Solana,
      standard: 6, // extrapolated to make it around 0,001 SOL
    };
    const gasPrices = [
      ethPrice,
      bscPrice,
      avaxPrice,
      ftmPrice,
      maticPrice,
      solanaPrice,
      arbPrice,
    ] as Array<GasPrice>;

    dispatch(setGasPrices(gasPrices));
  }, [dispatch, report]);

  useEffect(() => {
    fetchData().finally();
  }, [fetchData]);
};

export const useGetAssetUsdRate = (asset: Asset) => {
  const rates = useSelector($exchangeRates);
  const usdRate = findAssetExchangeRate(rates, asset);
  const getUsdRate = useCallback(
    (amount) => {
      if (usdRate === null) {
        return null;
      }
      return new BigNumber(amount).multipliedBy(usdRate).toString();
    },
    [usdRate]
  );

  return { getUsdRate, usdRate };
};
