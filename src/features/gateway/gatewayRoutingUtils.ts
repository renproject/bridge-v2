import { useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { paths } from "../../pages/routes";

export type GatewayLocationState = {
  reload?: boolean;
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
