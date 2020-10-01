import { Button, Link } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import React, { FunctionComponent } from "react";
import {
  Cartesian,
  RandomText,
  Section,
  SeparationWrapper,
} from "../PresentationHelpers";

export const NotificationsSection: FunctionComponent = () => {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Section header="Notifications (Alerts / Snackbars)">
      <Cartesian
        Component={Alert}
        Wrapper={SeparationWrapper}
        propVariants={{
          onClose: [() => {}],
          severity: ["error", "warning", "info", "success"],
        }}
      >
        <span>
          <RandomText /> <Link href="/">a link</Link>
        </span>
      </Cartesian>
      <Button
        onClick={() => {
          enqueueSnackbar("hi");
        }}
      >
        Snackbar
      </Button>
    </Section>
  );
};
