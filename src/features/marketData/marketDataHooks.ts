import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { setGasPrices, setExchangeRates } from "./marketDataSlice";
import {
  fetchMarketDataGasPrices,
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
    fetchMarketDataGasPrices().then((prices) => {
      dispatch(setGasPrices(prices));
    });
  }, [dispatch]);

  useEffect(fetchData, [fetchData]);

  return null;
};
