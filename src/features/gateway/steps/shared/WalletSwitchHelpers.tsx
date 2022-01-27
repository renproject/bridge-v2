import { Button, Typography } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import { Chain } from "@renproject/chains";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ActionButtonWrapper } from "../../../../components/buttons/Buttons";
import { WalletIcon } from "../../../../components/icons/RenIcons";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../../components/layout/Paper";
import { BridgeModal } from "../../../../components/modals/BridgeModal";
import {
  getChainConfig,
  getChainNetworkConfig,
} from "../../../../utils/chainsConfig";
import { $network } from "../../../network/networkSlice";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";

const useSwitchWalletDialogStyles = makeStyles((theme) => ({
  top: {
    marginBottom: 20,
    marginTop: 40,
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    width: 124,
    height: 124,
    backgroundColor: theme.palette.divider,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

type SwitchWalletDialogProps = DialogProps & {
  targetChain: Chain;
};

export const SwitchWalletDialog: FunctionComponent<SwitchWalletDialogProps> = ({
  open,
  targetChain,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const styles = useSwitchWalletDialogStyles();
  const chainConfig = getChainConfig(targetChain);
  const { network } = useSelector($network);
  const networkConfig = getChainNetworkConfig(targetChain, network);
  const handleSwitch = useCallback(() => {
    dispatch(setChain(targetChain));
    dispatch(setPickerOpened(true));
  }, [dispatch, targetChain]);

  return (
    <BridgeModal
      open={open}
      title={t("wallet.wallet-switch-title")}
      maxWidth="xs"
    >
      <SpacedPaperContent bottomPadding>
        <div className={styles.top}>
          <div className={styles.iconWrapper}>
            <div className={styles.icon}>
              <WalletIcon fontSize="inherit" />
            </div>
          </div>
        </div>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.wallet-switch-to", {
            chain: chainConfig.shortName,
            network: networkConfig.fullName,
          })}
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          align="center"
          gutterBottom
          component="div"
        >
          {t("wallet.wallet-switch-message", {
            chain: chainConfig.fullName,
            network: networkConfig.fullName,
          })}
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button color="primary" variant="text" onClick={handleSwitch}>
            {t("wallet.wallet-switch-label")}
          </Button>
        </ActionButtonWrapper>
      </PaperContent>
    </BridgeModal>
  );
};
