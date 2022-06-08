import { useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { paths } from "../../pages/routes";
import { useGatewayMeta } from "./gatewayHooks";
import {
  AdditionalGatewayParams,
  CreateGatewayParams,
  createGatewayQueryString,
  getGatewayExpiryTime,
  getGatewayNonce,
} from "./gatewayUtils";

export type GatewayLocationState = {
  reload?: boolean;
};

const reloadState: GatewayLocationState = {
  reload: true,
};

export const useGatewayLocationState = () => {
  const location = useLocation<GatewayLocationState>();
  const state = location.state;
  return {
    reload: state?.reload || false,
  } as GatewayLocationState;
};

export const useBasicRouteHandlers = () => {
  const history = useHistory();

  const handleGoToHome = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const handleGoToMint = useCallback(() => {
    history.push({
      pathname: paths.MINT,
    });
  }, [history]);

  const handleGoToRelease = useCallback(() => {
    history.push({
      pathname: paths.RELEASE,
    });
  }, [history]);

  const handleGoToMove = useCallback(() => {
    history.push({
      pathname: paths.RELEASE,
    });
  }, [history]);

  return {
    handleGoToHome,
    handleGoToMint,
    handleGoToRelease,
    handleGoToMove,
  };
};

export const useRedirectToGatewayFlow = (
  gatewayParams: CreateGatewayParams,
  additionalParams?: AdditionalGatewayParams
) => {
  const history = useHistory();
  const { asset, from, to, amount, nonce, toAddress } = gatewayParams;
  const { isBurnAndMint, isMint, isH2H, isRelease } = useGatewayMeta(
    asset,
    from,
    to
  );
  return useCallback(
    (dynamicAdditionalParams = additionalParams) => {
      const { partialTx, expiryTime } = dynamicAdditionalParams || {};
      if (isBurnAndMint) {
        // console.log("bridge (h2h)");
        history.push({
          state: reloadState,
          pathname: paths.BRIDGE_GATEWAY,
          search:
            "?" +
            createGatewayQueryString(
              {
                asset,
                from,
                to,
                amount,
                toAddress,
              },
              dynamicAdditionalParams
            ),
        });
      } else if (isMint && isH2H) {
        // console.log("h2h mint");
        history.push({
          state: reloadState,
          pathname: paths.MINT__GATEWAY_H2H,
          search:
            "?" +
            createGatewayQueryString(
              {
                asset,
                from,
                to,
                amount,
                toAddress,
              },
              dynamicAdditionalParams
            ),
        });
      } else if (isMint) {
        // console.log("standard mint");
        history.push({
          state: reloadState,
          pathname: paths.MINT__GATEWAY_STANDARD,
          search:
            "?" +
            createGatewayQueryString(
              {
                asset,
                from,
                to,
                toAddress,
                nonce: nonce || getGatewayNonce(),
              },
              { expiryTime: expiryTime || getGatewayExpiryTime(), partialTx }
            ),
        });
      } else if (isRelease && isH2H) {
        // console.log("h2h release");
        history.push({
          state: reloadState,
          pathname: paths.RELEASE__GATEWAY_H2H,
          search:
            "?" +
            createGatewayQueryString(
              {
                asset,
                from,
                to,
                amount,
                toAddress,
              },
              dynamicAdditionalParams
            ),
        });
      } else {
        // console.log("standard release");
        history.push({
          state: reloadState,
          pathname: paths.RELEASE__GATEWAY_STANDARD,
          search:
            "?" +
            createGatewayQueryString(
              {
                asset,
                from,
                to,
                amount,
                toAddress,
              },
              dynamicAdditionalParams
            ),
        });
      }
    },
    [
      history,
      isH2H,
      isMint,
      isRelease,
      isBurnAndMint,
      asset,
      from,
      to,
      toAddress,
      amount,
      nonce,
      additionalParams,
    ]
  );
};
