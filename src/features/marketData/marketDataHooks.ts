import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { BridgeChain } from "../../utils/assetConfigs";
import { setGasPrices, setExchangeRates } from "./marketDataSlice";
import {
  fetchEthMarketDataGasPrices,
  fetchMarketDataRates,
} from "./marketDataUtils";

const dataRefreshInterval = 30; // seconds

export const useExchangeRates = () => {
  const dispatch = useDispatch();

  const fetchData = useCallback(() => {
    fetchMarketDataRates()
      .then((rates) => {
        dispatch(setExchangeRates(rates));
      })
      .catch((e) => {
        //FIXME: handle this properly
        console.error(e);
      });
  }, [dispatch]);

  useEffect(fetchData, [fetchData]);
  useInterval(fetchData, dataRefreshInterval * 1000);

  return null;
};

export const useGasPrices = () => {
  const dispatch = useDispatch();

  const fetchData = useCallback(() => {
    fetchEthMarketDataGasPrices().then((anyBlockPrices) => {
      const fast = anyBlockPrices.fast;
      const ethPrice = {
        chain: BridgeChain.ETHC,
        standard: fast < 20 ? 50 : fast,
      };
      const bscPrice = {
        chain: BridgeChain.BSCC,
        standard: 20, // unable to find reliable source, but binance gas price is stable
      };
      const avaxPrice = {
        chain: BridgeChain.AVAXC,
        standard: 225, // taken from https://docs.avax.network/learn/platform-overview/transaction-fees#fee-schedule
      };
      const prices = [ethPrice, bscPrice, avaxPrice];
      dispatch(setGasPrices(prices));
    });
  }, [dispatch]);

  useEffect(fetchData, [fetchData]);

  return null;
};
