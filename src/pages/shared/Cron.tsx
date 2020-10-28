import { FunctionComponent, useCallback, useEffect } from "react";
import { useInterval } from "react-use";
import { useStore } from "../../providers/Store";
import { fetchMarketRates } from "../../services/marketData";
import { fetchFees } from "../../services/renJs";

const marketRatesRefreshInterval = 30;

export const Cron: FunctionComponent = () => {
  const [, dispatch] = useStore();

  useEffect(() => {
    fetchFees().then((fees) => {
      console.log("fees", fees);
      dispatch({
        type: "setFees",
        payload: fees,
      });
    });
  }, [dispatch]);

  const refreshRates = useCallback(() => {
    fetchMarketRates().then((rates) => {
      dispatch({
        type: "setExchangeRates",
        payload: rates,
      });
    });
  }, [dispatch]);
  useEffect(refreshRates, []);
  useInterval(refreshRates, marketRatesRefreshInterval * 1000);

  return null;
};
