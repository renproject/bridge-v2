import { useLocation } from "react-router-dom";

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
