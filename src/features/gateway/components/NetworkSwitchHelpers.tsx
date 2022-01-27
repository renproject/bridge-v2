import { Box, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { HorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";

export const WalletNetworkSwitchMessage: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <HorizontalPadder>
      <Box
        mt={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box maxWidth={240}>
          <Typography variant="caption" color="textSecondary">
            {t("h2h.network-switching-message")}
          </Typography>
        </Box>
        <TooltipWithIcon title={t("h2h.network-switching-tooltip")} />
      </Box>
    </HorizontalPadder>
  );
};
