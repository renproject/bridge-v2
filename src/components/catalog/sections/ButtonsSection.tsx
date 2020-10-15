import { Button } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useState } from 'react'
import {
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  ToggleIconButton,
  TransactionDetailsButton,
  TransactionHistoryMenuIconButton,
  TxHistoryIconButton,
} from '../../buttons/Buttons'
import { QrCodeIcon } from '../../icons/RenIcons'
import { Cartesian, Section, SeparationWrapper } from '../PresentationHelpers'

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
          <TxHistoryIconButton />
          <QrCodeIconButton />
          <TransactionHistoryMenuIconButton />
        </SeparationWrapper>
        <SeparationWrapper>
          <CopyContentButton content="1LU14szcGuMwxVNet1rm" />
          <TransactionDetailsButton
            chain="ETH"
            address="0x7a36479806342F7a1d663fF43A0D340b733FA764"
          />
          <br />
          <TransactionDetailsButton
            chain="BTC"
            address="1LU14szcGuMwxVNet1rm"
          />
        </SeparationWrapper>
        <SeparationWrapper>
          <BigQrCode>
            <QrCodeIcon fontSize="inherit"/>
          </BigQrCode>
        </SeparationWrapper>
      </Section>
    </>
  );
};
