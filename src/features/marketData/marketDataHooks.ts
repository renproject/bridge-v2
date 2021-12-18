import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useInterval } from "react-use";
import { getBandchain } from "../../services/bandchain";
import { useReportSystemStatus } from "../ui/uiHooks";
import { SystemStatus, SystemType } from "../ui/uiSlice";
import { setGasPrices, updateExchangeRates } from "./marketDataSlice";
import {
  BandchainReferenceData,
  bandchainReferencePairs,
  CoingeckoReferenceData,
  coingeckoSymbols,
  fetchMarketDataGasPrices,
  mapBandchainToExchangeRate,
  mapCoingeckoToExchangeRate,
} from "./marketDataUtils";

const dataRefreshInterval = 30; // seconds

const fetchBandchainExchangeRates = () => {
  return getBandchain().getReferenceData(bandchainReferencePairs, 10, 16);
};

const fetchCoingeckoExchangeRates = async () => {
  return fetch(
    "https://api.coingecko.com/api/v3" +
      `/coins/markets?vs_currency=usd&ids=${coingeckoSymbols.join(",")}`
  ).then((response) => response.json());
};

export const useExchangeRates = () => {
  const dispatch = useDispatch();
  const report = useReportSystemStatus();
  const fetchData = useCallback(() => {
    fetchBandchainExchangeRates()
      .then((data: Array<BandchainReferenceData>) => {
        report(SystemType.Bandchain, SystemStatus.Operational);
        const rates = mapBandchainToExchangeRate(data);
        dispatch(updateExchangeRates(rates));
      })
      .catch((error: any) => {
        report(SystemType.Bandchain, SystemStatus.Failure);
        console.error(error);
      });

    fetchCoingeckoExchangeRates()
      .then((data: Array<CoingeckoReferenceData>) => {
        report(SystemType.Coingecko, SystemStatus.Operational);
        const rates = mapCoingeckoToExchangeRate(data);
        dispatch(updateExchangeRates(rates));
      })
      .catch((error: any) => {
        report(SystemType.Coingecko, SystemStatus.Failure);
        console.error(error);
      });
  }, [dispatch, report]);

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
