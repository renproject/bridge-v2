import { Divider, Fade, IconButton } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Ethereum } from "@renproject/chains-ethereum";
import BigNumber from "bignumber.js";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import { OutlinedTextField } from "../../../components/inputs/OutlinedTextField";
import {
  MediumTopWrapper,
  MediumWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import {
  assetsConfig,
  getAssetConfig,
  getRenAssetName,
} from "../../../utils/tokensConfig";
import { $exchangeRates, $marketData } from "../../marketData/marketDataSlice";
import { findAssetExchangeRate } from "../../marketData/marketDataUtils";
import { useChains } from "../../network/networkHooks";
import { $network } from "../../network/networkSlice";
import { useWallet } from "../../wallet/walletHooks";
import { useGateway, useGatewayFees } from "../gatewayHooks";
import { $gateway } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

export const GatewayFeesStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation();
  const { network } = useSelector($network);
  const { asset, from, to } = useSelector($gateway);
  const { Icon, shortName } = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const [amount, setAmount] = useState("42");
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value.replace(",", ".");
    if (!isNaN(newValue)) {
      setAmount(newValue);
    }
  }, []);

  const { connected } = useWallet(to);

  const { gateway, transactions } = useGateway({
    asset,
    from,
    to,
    amount,
    network,
    nonce: 1,
  });

  const fees = useGatewayFees(gateway, amount);
  const {
    balance,
    balancePending,
    outputAmount,
    minimumAmount,
    amountsPending,
  } = fees;

  const rates = useSelector($exchangeRates);
  const outputAmountUsdRate = findAssetExchangeRate(rates, asset);
  const outputAmountUsd =
    outputAmountUsdRate !== null
      ? Number(outputAmount) * outputAmountUsdRate
      : null;

  const Header = (
    <PaperHeader>
      <PaperNav>
        <IconButton onClick={onPrev}>
          <BackArrowIcon />
        </IconButton>
      </PaperNav>
      <PaperTitle>{t("mint.fees-title")}</PaperTitle>
      <PaperActions />
    </PaperHeader>
  );
  if (!connected) {
    return (
      <>
        {Header}
        <PaperContent bottomPadding>
          <span>Please connect a wallet to proceed</span>
        </PaperContent>
      </>
    );
  }

  const showBalance = true;

  return (
    <>
      {Header}
      <PaperContent bottomPadding>
        {showBalance && (
          <LabelWithValue
            label={t("common.balance-label")}
            value={
              <span>
                {balancePending ? (
                  <InlineSkeleton
                    variant="rect"
                    animation="pulse"
                    width={40}
                    height={12}
                  />
                ) : (
                  <Fade in={true}>
                    <span>{balance}</span>
                  </Fade>
                )}
                <span> {renAsset}</span>
              </span>
            }
          />
        )}
        <OutlinedTextField
          value={amount}
          onChange={handleAmountChange}
          label="How much will you send?"
          InputProps={{ endAdornment: shortName }}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
                decimalScale={3} // TODO: make dynamic decimal scale based on input decimals
              />
            }
            valueEquivalent={
              outputAmountUsd !== null ? (
                <NumberFormatText
                  prefix=" = $"
                  value={outputAmountUsd}
                  spacedSuffix="USD"
                  decimalScale={2}
                  fixedDecimalScale
                />
              ) : null
            }
            Icon={<Icon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <span>Feessss</span>
      </PaperContent>
      <Debug it={{ fees }} />
    </>
  );
};
