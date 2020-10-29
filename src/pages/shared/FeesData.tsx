import { FunctionComponent, useCallback, useEffect } from "react";
import { useInterval } from "react-use";
import { useStore } from "../../providers/Store";
import { fetchMarketRates } from "../../services/marketData";
import { fetchFees } from "../../services/renJs";

const marketRatesRefreshInterval = 30;

export const MarketData: FunctionComponent = () => {
  const [, dispatch] = useStore();

  useEffect(() => {
    fetchFees().then((fees) => {
      dispatch({
        type: "setFees",
        payload: fees,
      });
    });
  }, [dispatch]);

  return null;
};
