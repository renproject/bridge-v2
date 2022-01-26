import { Typography } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import { Chain } from "@renproject/chains";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  ActionButtonWrapper,
  SmallActionButton,
} from "../../../../components/buttons/Buttons";
import { WalletIcon } from "../../../../components/icons/RenIcons";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../../components/layout/Paper";
import { BridgeModal } from "../../../../components/modals/BridgeModal";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";

const useSwitchWalletDialogStyles = makeStyles((theme) => ({
  iconWrapper: {
    borderRadius: "50%",
    padding: 13,
    backgroundColor: theme.palette.divider,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 44,
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

  const handleSwitch = useCallback(() => {
    dispatch(setChain(targetChain));
    dispatch(setPickerOpened(true));
  }, [dispatch, targetChain]);

  return (
    <BridgeModal
      open={open}
      title={t("wallet.switch-wallet-title")}
      maxWidth="xs"
    >
      <PaperContent>
        <div className={styles.iconWrapper}>
          <WalletIcon fontSize="inherit" />
        </div>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.switch-wallet-title")}
        </Typography>
        <Typography
          color="textSecondary"
          align="center"
          gutterBottom
          component="div"
        >
          {t("wallet.switch-wallet-message", { chain: chainConfig.fullName })}
        </Typography>
        <ActionButtonWrapper>
          <SmallActionButton onClick={handleSwitch}>
            {t("wallet.switch-wallet-label")}
          </SmallActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </BridgeModal>
  );
};
