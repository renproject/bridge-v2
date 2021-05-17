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
    fetchMarketDataRates().then((rates) => {
      dispatch(setExchangeRates(rates));
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
      const ethPrice = {
        chain: BridgeChain.ETHC,
        standard: anyBlockPrices.fast,
      };
      const bscPrice = {
        chain: BridgeChain.BSCC,
        standard: 20, // unable to find reliable source, but binance gas price is stable
      };
      const prices = [ethPrice, bscPrice];
      dispatch(setGasPrices(prices));
    });
  }, [dispatch]);

  useEffect(fetchData, [fetchData]);

  return null;
};
