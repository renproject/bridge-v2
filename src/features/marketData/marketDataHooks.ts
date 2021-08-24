import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { getBandchain } from "../../services/bandchain";
import {
  setSystemMonitorStatus,
  SystemStatus,
  SystemType,
} from "../ui/uiSlice";
import { setExchangeRates, setGasPrices } from "./marketDataSlice";
import {
  BandchainExchangeRateEntry,
  bandchainReferencePairs,
  CoingeckoExchangeRateEntry,
  coingeckoSymbols,
  fetchMarketDataGasPrices,
  mapBandchainToExchangeData,
  mapCoingeckoToExchangeData,
} from "./marketDataUtils";

const dataRefreshInterval = 30; // seconds

export const useExchangeRates = () => {
  const dispatch = useDispatch();

  const fetchMarketDataRates = useCallback(async () => {
    const bandchain = await getBandchain()
      .getReferenceData(bandchainReferencePairs)
      .then((data: Array<BandchainExchangeRateEntry>) => {
        dispatch(
          setSystemMonitorStatus({
            type: SystemType.Bandchain,
            status: SystemStatus.Operational,
          })
        );

        return mapBandchainToExchangeData(data);
      })
      .catch((error: any) => {
        console.error(error);
        dispatch(
          setSystemMonitorStatus({
            type: SystemType.Bandchain,
            status: SystemStatus.Failure,
          })
        );
        return [];
      });

    const coingecko = await fetch(
      "https://api.coingecko.com/api/v3" +
        `/coins/markets?vs_currency=usd&ids=${coingeckoSymbols.join(",")}`
    )
      .then((response) => response.json())
      .then((data: Array<CoingeckoExchangeRateEntry>) => {
        dispatch(
          setSystemMonitorStatus({
            type: SystemType.Coingecko,
            status: SystemStatus.Operational,
          })
        );
        return mapCoingeckoToExchangeData(data);
      })
      .catch((error: any) => {
        dispatch(
          setSystemMonitorStatus({
            type: SystemType.Coingecko,
            status: SystemStatus.Failure,
          })
        );
        return [];
      });

    return [...bandchain, ...coingecko];
  }, [dispatch]);

  const fetchData = useCallback(() => {
    fetchMarketDataRates()
      .then((rates) => {
        dispatch(setExchangeRates(rates));
      })
      .catch((e) => {
        //FIXME: handle this properly
        console.error(e);
      });
  }, [dispatch, fetchMarketDataRates]);

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
