import { useLocation } from "react-router-dom";

export type GatewayLocationState = {
  renVMHashReplaced?: boolean;
  renVMHashDetected?: boolean;
  reload?: boolean;
};

export const useGatewayLocationState = () => {
  const location = useLocation<GatewayLocationState>();
  const state = location.state;
  return {
    renVMHashDetected: state?.renVMHashDetected || false,
    renVMHashReplaced: state?.renVMHashReplaced || false,
    reload: state?.reload || false,
  } as GatewayLocationState;
};
