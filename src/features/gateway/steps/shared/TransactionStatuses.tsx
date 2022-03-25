import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Chain } from "@renproject/chains";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import { Link } from "../../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../../components/typography/TypographyHelpers";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { useBasicRouteHandlers } from "../../gatewayRoutingUtils";

type FromToTxLinksProps = {
  from: Chain;
  to: Chain;
  fromTxUrl: string | null;
  toTxUrl: string | null;
};

export const FromToTxLinks: FunctionComponent<FromToTxLinksProps> = ({
  from,
  to,
  fromTxUrl,
  toTxUrl,
}) => {
  const { t } = useTranslation();
  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);

  return (
    <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
      {fromTxUrl !== null && (
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={fromTxUrl}
        >
          {fromChainConfig.shortName} {t("common.transaction")}
        </Link>
      )}
      {toTxUrl !== null && (
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={toTxUrl}
        >
          {toChainConfig.shortName} {t("common.transaction")}
        </Link>
      )}
    </Box>
  );
};

const useSentReceivedSectionStyles = makeStyles({
  root: {
    marginTop: 60,
    marginBottom: 60, // 90 from desings
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
  },
});

type SentReceivedSectionProps = {
  asset: string;
  receivedAmount: string | null;
  sentAmount: string | null;
  isRelease?: boolean;
};

export const SentReceivedSection: FunctionComponent<
  SentReceivedSectionProps
> = ({ receivedAmount, sentAmount, asset, isRelease }) => {
  const styles = useSentReceivedSectionStyles();
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const sentAsset = isRelease
    ? renAssetConfig.shortName
    : assetConfig.shortName;

  const receivedAsset = isRelease
    ? assetConfig.shortName
    : renAssetConfig.shortName;

  return (
    <div className={styles.root}>
      <Typography
        className={styles.title}
        variant="h5"
        align="center"
        gutterBottom
      >
        <NumberFormatText value={receivedAmount} spacedSuffix={receivedAsset} />{" "}
        received!
      </Typography>
      <Typography color="textSecondary" component="div">
        <LabelWithValue
          label="Initially sent"
          labelTooltip="The amount you initially sent"
          colorVariant="inherit"
          fontSizeVariant="bigger"
          value={
            <span>
              {sentAmount} {sentAsset}
            </span>
          }
        />
      </Typography>
    </div>
  );
};

type ProgressDoneProps = {
  color: string;
};

export const ProgressDone: FunctionComponent<ProgressDoneProps> = ({
  color,
}) => {
  return (
    <ProgressWrapper>
      <ProgressWithContent color={color}>
        <BigDoneIcon />
      </ProgressWithContent>
    </ProgressWrapper>
  );
};

type ChainProgressDoneProps = {
  chain: Chain;
};

export const ChainProgressDone: FunctionComponent<ChainProgressDoneProps> = ({
  chain,
}) => {
  const chainConfig = getChainConfig(chain);
  return <ProgressDone color={chainConfig.color} />;
};

export const GoToHomeActionButton: FunctionComponent = () => {
  // TODO: return to home
  const { t } = useTranslation();
  const { handleGoToHome } = useBasicRouteHandlers();
  return (
    <ActionButton onClick={handleGoToHome}>
      {t("navigation.back-to-home-label")}
    </ActionButton>
  );
};
