import { RenNetwork } from "@renproject/interfaces";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { paths } from "../../pages/routes";
import {
  BridgeChain,
  EthTestnet,
  getCurrencyConfig,
  toMintedCurrency,
} from "../../utils/assetConfigs";
import { $mintCurrency } from "../mint/mintSlice";
import { $network } from "../network/networkSlice";
import { $releaseCurrency } from "../release/releaseSlice";
import { $chain } from "../wallet/walletSlice";
import { setPaperShaking } from "./uiSlice";

export const useShakePaper = (shake: boolean, timeout = 600) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (shake) {
      dispatch(setPaperShaking(true));
      setTimeout(() => {
        dispatch(setPaperShaking(false));
      }, timeout);
    }
    return () => {
      dispatch(setPaperShaking(false));
    };
  }, [dispatch, shake, timeout]);
};

export const useLocationFlow = () => {
  const location = useLocation();
  if (location.pathname.indexOf(paths.MINT) > -1) {
    return "mint";
  } else if (location.pathname.indexOf(paths.RELEASE) > -1) {
    return "burn";
  }
  return null;
};

export const useTestnetName = () => {
  const flow = useLocationFlow();
  const chain = useSelector($chain);
  const network = useSelector($network);
  const mintCurrency = useSelector($mintCurrency);
  const releaseCurrency = useSelector($releaseCurrency);
  if (
    chain !== BridgeChain.ETHC ||
    flow == null ||
    network === RenNetwork.Mainnet
  ) {
    return "";
  }
  const renCurrency =
    flow === "mint" ? toMintedCurrency(mintCurrency) : releaseCurrency;
  const currencyConfig = getCurrencyConfig(renCurrency);
  return currencyConfig.ethTestnet || EthTestnet.KOVAN;
};
