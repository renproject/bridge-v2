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
  BandchainReferenceData,
  bandchainReferencePairs,
  CoingeckoReferenceData,
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
      .getReferenceData(bandchainReferencePairs, 3, 4)
      .then((data: Array<BandchainReferenceData>) => {
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
      .then((data: Array<CoingeckoReferenceData>) => {
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
        console.error(e);
      });
  }, [dispatch, fetchMarketDataRates]);

  useEffect(fetchData, [fetchData]);
  useInterval(fetchData, dataRefreshInterval * 1000);
};

export const useGasPrices = () => {
  const dispatch = useDispatch();

  const fetchData = useCallback(() => {
    fetchMarketDataGasPrices().then((prices) => {
      dispatch(setGasPrices(prices));
    });
  }, [dispatch]);

  useEffect(fetchData, [fetchData]);
};
