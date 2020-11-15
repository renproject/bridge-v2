import { Divider, IconButton } from "@material-ui/core";
import { GatewaySession } from "@renproject/rentx";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import {
  ActionButton,
  ToggleIconButton,
} from "../../../components/buttons/Buttons";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import {
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { Debug } from "../../../components/utils/Debug";
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { usePaperTitle } from "../../../pages/MainPage";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  getCurrencyConfigByRentxName,
  getMintedDestinationCurrencySymbol,
} from "../../../utils/assetConfigs";
import { useMintMachine } from "../../mint/mintUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import { BookmarkPageWarning } from "../../transactions/components/TransactionsHelpers";
import { TxType, useTxParam } from "../../transactions/transactionsUtils";
import { setWalletPickerOpened } from "../../wallet/walletSlice";

export const ReleaseProcessStep: FunctionComponent<RouteComponentProps> = (
  props
) => {
  const { history } = props;
  const [title] = usePaperTitle();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const { tx: parsedTx, txState } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); // TODO Partial<GatewaySession>

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);
  const walletConnected = status === "connected";
  const txCurrency = getCurrencyConfigByRentxName(tx.sourceAsset).symbol;
  const feeCurrency = getMintedDestinationCurrencySymbol(txCurrency);
  const amount = Number(tx.targetAmount);
  const showTransactionStatus = true;

  return (
    <>
      <PaperHeader>
        <PaperNav>
          {txState?.newTx && (
            <IconButton onClick={handlePreviousStepClick}>
              <BackArrowIcon />
            </IconButton>
          )}
        </PaperNav>
        <PaperTitle>{title}</PaperTitle>
        <PaperActions>
          <ToggleIconButton variant="settings" />
          <ToggleIconButton variant="notifications" />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        {showTransactionStatus && <ReleaseTransactionStatus tx={tx} />}
        {!walletConnected && (
          <BigWrapper>
            <MediumWrapper>
              <CenteringSpacedBox>
                <WalletConnectionProgress />
              </CenteringSpacedBox>
            </MediumWrapper>
            <ActionButton onClick={handleWalletPickerOpen}>
              Connect Wallet
            </ActionButton>
          </BigWrapper>
        )}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <TransactionFees
          amount={amount}
          currency={feeCurrency}
          type={TxType.BURN}
        />
        <Debug it={{ parsedTx, txState: txState }} />
      </PaperContent>
      {txState?.newTx && <BookmarkPageWarning />}
    </>
  );
};

type ReleaseTransactionStatusProps = {
  tx: GatewaySession;
};
const ReleaseTransactionStatus: FunctionComponent<ReleaseTransactionStatusProps> = ({
  tx,
}) => {
  const [current] = useMintMachine(tx);
  //TODO render steps
  return <Debug it={{ tx, current }} />;
};