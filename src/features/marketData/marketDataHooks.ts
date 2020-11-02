import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { setMarketDataGasPrices, setMarketDataRates } from "./marketDataSlice";
import {
  fetchMarketDataGasPrices,
  fetchMarketDataRates,
} from "./marketDataUtils";

const ratesRefreshSecondsInterval = 30;

export const useMarketDataRates = () => {
  const dispatch = useDispatch();

  const refreshRates = useCallback(() => {
    fetchMarketDataRates().then((rates) => {
      dispatch(setMarketDataRates(rates));
    });
  }, [dispatch]);

  useEffect(refreshRates, []);
  useInterval(refreshRates, ratesRefreshSecondsInterval * 1000);

  return null;
};

export const useMarketDataGasPrice = () => {
  const dispatch = useDispatch();

  const refreshRates = useCallback(() => {
    fetchMarketDataGasPrices().then((prices) => {
      dispatch(setMarketDataGasPrices(prices));
    });
  }, [dispatch]);

  useEffect(refreshRates, []);

  return null;
};
