import { Gateway } from "@renproject/ren";
import { createStateContext } from "react-use";

export type GatewayContext = Gateway | null;

const [useGatewayContext, GatewayContextProvider] =
  createStateContext<GatewayContext>(null);

export { useGatewayContext, GatewayContextProvider };
