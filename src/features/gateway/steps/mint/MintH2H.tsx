import { Gateway } from "@renproject/ren";
import { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import { Debug } from "../../../../components/utils/Debug";

export type LocationGatewayState = {
  gateway?: Gateway | null;
};

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
}) => {
  const locationState = location?.state as LocationGatewayState;
  const gateway = locationState?.gateway || null;

  return (
    <>
      <span>aaa</span>
      <Debug it={{ gateway, locationState }} />
    </>
  );
};
