import { GatewaySession } from "@renproject/rentx";
import { FunctionComponent, useEffect } from "react";
import { useBurnMachine } from "../releaseUtils";

export const releaseTooltips = {
  releasing: "The amount and asset you're releasing before fees are applied.",
  to: "The wallet address you're receiving the assets to.",
};

type BurnAndReleaseTransactionInitializerProps = {
  initialTx: GatewaySession;
  onCreated?: (tx: GatewaySession) => void;
};

export const BurnAndReleaseTransactionInitializer: FunctionComponent<BurnAndReleaseTransactionInitializerProps> = ({
  initialTx,
  onCreated,
}) => {
  const [current, , service] = useBurnMachine(initialTx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );
  console.log("buring initialized...", current.value);
  useEffect(() => {
    console.log("current.context.tx", current.context.tx);
    if (onCreated && current.value === "created") {
      onCreated(current.context.tx);
    }
  }, [onCreated, current.value, current.context.tx]);

  return null;
};
