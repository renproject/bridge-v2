import { FunctionComponent, useCallback, useEffect } from 'react'
import { useInterval } from 'react-use'
import { useStore } from '../../providers/Store'
import { fetchMarketRates } from '../../services/marketData'

const marketRatesRefreshInterval = 30;

export const MarketRatesData: FunctionComponent = () => {
  const [, dispatch] = useStore();

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
