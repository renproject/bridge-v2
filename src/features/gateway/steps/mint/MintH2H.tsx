import { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import { Debug } from "../../../../components/utils/Debug";
import { useSharedGateway } from "../../gatewaySlice";

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = ({}) => {
  const [gateway] = useSharedGateway();

  console.log("gateway", gateway);

  return (
    <>
      <span>aaa</span>
      <Debug it={{}} />
    </>
  );
};
