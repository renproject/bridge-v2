import { Box } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { FunctionComponent } from "react";
import {
  ProgressStatus,
  ProgressStatusProps,
} from "../../transactions/components/TransactionsHelpers";
import { GatewayPaperHeader } from "../steps/shared/GatewayNavigationHelpers";
import { PCW } from "./PaperHelpers";

export const GatewayLoaderStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading gateway...",
  processing,
}) => {
  return (
    <>
      <ProgressStatus reason={reason} processing={processing} />
      <Box mb={3} display="flex" justifyContent="center">
        <Skeleton width={200} />
      </Box>
      <Box mb={3}>
        <Skeleton width={320} height={54} />
      </Box>
      <Box mb={3} display="flex" justifyContent="spaceBetween">
        <Skeleton width={70} height={17} />
        <Skeleton width={70} height={17} />
      </Box>
    </>
  );
};

export const GatewayPaperLoader: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading gateway...",
}) => {
  return (
    <>
      <GatewayPaperHeader title={reason} />
      <PCW>
        <GatewayLoaderStatus reason={reason} />
      </PCW>
    </>
  );
};
