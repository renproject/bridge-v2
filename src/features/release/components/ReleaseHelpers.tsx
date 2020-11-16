import { GatewaySession } from "@renproject/rentx";
import { FunctionComponent, useEffect } from "react";
import { useBurnMachine } from "../releaseUtils";

export const releaseTooltips = {
  releasing: "The amount and asset you're releasing before fees are applied.",
  to: "The wallet address you're receiving the assets to.",
};

type BurnTransactionInitializerProps = {
  initialTx: GatewaySession;
  onCreated?: (tx: GatewaySession) => void;
};

export const BurnTransactionInitializer: FunctionComponent<BurnTransactionInitializerProps> = ({
  initialTx,
  onCreated,
}) => {
  const [current] = useBurnMachine(initialTx);
  console.log("buring initialized...");
  useEffect(() => {
    console.log("current.value", current.value);
  }, [current]);
  useEffect(() => {
    console.log("current.context.tx", current.context.tx);
    if (onCreated && current.value === "srcSettling") {
      onCreated(current.context.tx);
    }
  }, [onCreated, current.context.tx]);

  return null;
};
