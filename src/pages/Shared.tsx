import {
  Checkbox,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { ActionButton } from "../components/buttons/Buttons";
import { CheckboxWrapper } from "../components/inputs/InputHelpers";
import { PaperContent } from "../components/layout/Paper";
import { Link as StyledLink } from "../components/links/Links";
import { BridgeModal } from "../components/modals/BridgeModal";
import { SpacedTypography } from "../components/typography/TypographyHelpers";
import { links, storageKeys } from "../constants/constants";

const legacyAck = Boolean(localStorage.getItem(storageKeys.LEGACY_ACK));

export const LegacyBridgeModal: FunctionComponent = () => {
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
          Welcome to RenBridge 2.1
        </SpacedTypography>
        <SpacedTypography variant="body1" align="center">
          If you're here to complete a transaction you started in the past,
          you'll need to finish it on RenBridge 2.0,{" "}
          <StyledLink external color="primary" href={links.LEGACY_BRIDGE}>
            head here
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
                  Don't show it again
                </FormLabel>
              }
            />
          </FormControl>
        </CheckboxWrapper>
      </PaperContent>
      <DialogActions disableSpacing>
        <ActionButton onClick={handleClose}>
          Continue to RenBridge 2.1
        </ActionButton>
      </DialogActions>
    </BridgeModal>
  );
};
