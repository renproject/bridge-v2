import { Box } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { FunctionComponent } from "react";
import {
  ProgressStatus,
  ProgressStatusProps,
} from "../../transactions/components/TransactionsHelpers";

export const GatewayLoaderStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading gateway...",
  processing,
}) => {
  return (
    <>
      <ProgressStatus reason={reason} processing={processing} />
      <Box mb={20} display="flex" justifyContent="center">
        <Skeleton width={200} />
      </Box>
      <Box mb={20}>
        <Skeleton width={320} height={54} />
      </Box>
      <Box mb={20} display="flex" justifyContent="spaceBetween">
        <Skeleton width={70} height={17} />
        <Skeleton width={70} height={17} />
      </Box>
    </>
  );
};
