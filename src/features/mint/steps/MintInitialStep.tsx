import { Divider } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import {
  AssetDropdown,
  AssetDropdownWrapper,
} from "../../../components/dropdowns/AssetDropdown";
import { PaperContent } from "../../../components/layout/Paper";
import {
  supportedLockCurrencies,
  supportedMintDestinationChains,
  toMintedCurrency,
} from "../../../utils/assetConfigs";
import { useRenNetworkTracker } from "../../transactions/transactionsHooks";
import { TxConfigurationStepProps } from "../../transactions/transactionsUtils";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import { MintIntro } from "../components/MintHelpers";
import { $mint, setMintCurrency } from "../mintSlice";

export const MintInitialStep: FunctionComponent<TxConfigurationStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();

  const { currency } = useSelector($mint);
  const { chain } = useSelector($wallet);
  const { walletConnected } = useSelectedChainWallet();

  const handleCurrencyChange = useCallback(
    (event) => {
      dispatch(setMintCurrency(event.target.value));
    },
    [dispatch]
  );
  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );

  const renCurrency = toMintedCurrency(currency);
  useRenNetworkTracker(renCurrency);

  const handleNextStep = useCallback(() => {
    if (!walletConnected) {
      dispatch(setWalletPickerOpened(true));
    } else {
      if (onNext) {
        onNext();
      }
    }
  }, [dispatch, onNext, walletConnected]);

  return (
    <>
      <PaperContent bottomPadding>
        <MintIntro />
        <AssetDropdownWrapper>
          <AssetDropdown
            label="Send"
            mode="send"
            available={supportedLockCurrencies}
            value={currency}
            onChange={handleCurrencyChange}
          />
        </AssetDropdownWrapper>
        <AssetDropdownWrapper>
          <AssetDropdown
            label="Destination"
            mode="chain"
            available={supportedMintDestinationChains}
            value={chain}
            onChange={handleChainChange}
          />
        </AssetDropdownWrapper>
      </PaperContent>
      <Divider />
      <PaperContent darker topPadding bottomPadding>
        <ActionButtonWrapper>
          <ActionButton onClick={handleNextStep}>
            {walletConnected ? "Next" : "Connect Wallet"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
