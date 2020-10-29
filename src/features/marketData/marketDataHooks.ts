import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { setMarketDataRates } from "./marketDataSlice";
import { fetchMarketDataRates } from "./marketDataUtils";

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
