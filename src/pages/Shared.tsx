import {
  Checkbox,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../components/buttons/Buttons";
import { CheckboxWrapper } from "../components/inputs/InputHelpers";
import { PaperContent } from "../components/layout/Paper";
import { Link as StyledLink } from "../components/links/Links";
import { BridgeModal } from "../components/modals/BridgeModal";
import { SpacedTypography } from "../components/typography/TypographyHelpers";
import { links, storageKeys } from "../constants/constants";

const legacyAck = Boolean(localStorage.getItem(storageKeys.LEGACY_ACK));

export const LegacyBridgeModal: FunctionComponent = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(!legacyAck);
  const [checked, setChecked] = useState(false);
  const handleClose = useCallback(() => {
    setOpen(false);
    if (checked) {
      localStorage.setItem(storageKeys.LEGACY_ACK, "1");
    }
  }, [checked]);
  const handleChecked = useCallback(() => {
    setChecked(!checked);
  }, [checked]);
  return (
    <BridgeModal open={open} maxWidth="xs" title="RenBridge 2.1">
      <PaperContent topPadding>
        <SpacedTypography variant="h5" align="center" gutterBottom>
          {t("welcome.welcome-to")} RenBridge 2.1
        </SpacedTypography>
        <SpacedTypography variant="body1" align="center">
          {t("welcome.legacy-message")} RenBridge 2.0,{" "}
          <StyledLink external color="primary" href={links.LEGACY_BRIDGE}>
            {t("welcome.legacy-head-here")}
          </StyledLink>
        </SpacedTypography>
        <CheckboxWrapper>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={handleChecked}
                  name="legacy_ack"
                  color="primary"
                />
              }
              label={
                <FormLabel htmlFor="ack" component={Typography}>
                  {t("welcome.legacy-ack-label")}
                </FormLabel>
              }
            />
          </FormControl>
        </CheckboxWrapper>
      </PaperContent>
      <DialogActions disableSpacing>
        <ActionButton onClick={handleClose}>
          {t("welcome.continue-to")} RenBridge 2.1
        </ActionButton>
      </DialogActions>
    </BridgeModal>
  );
};
