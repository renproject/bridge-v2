import { useLocation } from "react-router-dom";

export type GatewayLocationState = {
  renVMHashReplaced?: boolean;
  renVMHashDetected?: boolean;
};

export const useGatewayLocationState = () => {
  const location = useLocation<GatewayLocationState>();
  const state = location.state;
  return {
    renVMHashDetected: state?.renVMHashDetected || false,
    renVMHashReplaced: state?.renVMHashReplaced || false,
  } as GatewayLocationState;
};
