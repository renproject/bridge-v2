import { Button } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { GatewayButton, QrCodeIconButton, ToggleIconButton } from '../../buttons/Buttons'
import { Cartesian, Section, SeparationWrapper } from "../PresentationHelpers";

export const ButtonsSection: FunctionComponent = () => {
  const [settings, setSettings] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const toggleSettings = useCallback(() => {
    setSettings(!settings);
  }, [settings]);
  const toggleNotifications = useCallback(() => {
    setNotifications(!notifications);
  }, [notifications]);
  return (
    <>
      <Section header="Buttons">
        <SeparationWrapper>
          <Button variant="contained" color="primary" size="large">
            Primary Button
          </Button>
          <Button variant="contained" color="secondary" size="large">
            Secondary Button
          </Button>
        </SeparationWrapper>
        <Cartesian
          Component={Button}
          Wrapper={SeparationWrapper}
          content={(props: any) => `${props.color}`}
          propVariants={{
            variant: ["contained"],
            size: ["large", "small"],
            color: ["primary", "secondary"],
            disabled: [true, false],
          }}
        />
      </Section>
      <Section header="Special Buttons">
        <SeparationWrapper>
          <ToggleIconButton
            variant="settings"
            pressed={settings}
            onClick={toggleSettings}
          />
          <ToggleIconButton
            variant="notifications"
            pressed={notifications}
            onClick={toggleNotifications}
          />
          <QrCodeIconButton />
        </SeparationWrapper>
        <SeparationWrapper>
          <GatewayButton>1LU14szcGuMwxVNet1rm</GatewayButton>
        </SeparationWrapper>
      </Section>
    </>
  );
};
