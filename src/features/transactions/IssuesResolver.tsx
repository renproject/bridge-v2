import { Box, DialogContent, Fab, Fade, Typography } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import { Feedback } from "@material-ui/icons";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
  ClosableMenuIconButton,
  CopyContentTypography,
} from "../../components/buttons/Buttons";
import { IssueResolverIcon } from "../../components/icons/RenIcons";
import { externalLinkAttributes, Link } from "../../components/links/Links";
import { BridgeModalTitle } from "../../components/modals/BridgeModal";
import { Debug } from "../../components/utils/Debug";
import { links } from "../../constants/constants";
import { parseGatewayQueryString } from "../gateway/gatewayUtils";
import { useRenVMExplorerLink } from "../network/networkHooks";
import { WideDialog } from "./components/TransactionsHistoryHelpers";
import {
  $issueResolver,
  $transactions,
  setIssueResolverOpened,
} from "./transactionsSlice";

export const FundsChip = styled("p")(({ theme }) => ({
  padding: `16px 47px`,
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: 20,
  textAlign: "center",
  color: theme.palette.primary.main,
  display: "inline-block",
}));

const useIssueResolverStyles = makeStyles((theme) => ({
  content: {
    textAlign: "center",
  },
  text: {
    maxInlineSize: 370,
  },
}));

const MaxBox = styled("div")({
  maxWidth: 370,
  margin: "16px auto",
});

export const IssuesResolver: FunctionComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { additionalParams } = parseGatewayQueryString(location.search);
  const { renVMHash } = additionalParams;
  const dispatch = useDispatch();
  const styles = useIssueResolverStyles();
  const { getRenVmExplorerLink } = useRenVMExplorerLink();
  const { dialogOpened } = useSelector($issueResolver);
  const { currentTxHash } = useSelector($transactions);

  const txHash = currentTxHash || (renVMHash as string);
  const handleClose = useCallback(() => {
    dispatch(setIssueResolverOpened(false));
  }, [dispatch]);

  const explorer = getRenVmExplorerLink(txHash);
  return (
    <WideDialog
      open={dialogOpened}
      onClose={handleClose}
      // onEscapeKeyDown={handleClose}
      // onBackdropClick={handleClose}
    >
      <BridgeModalTitle onClose={handleClose}>
        {t("tx.issue-resolver-title")}
      </BridgeModalTitle>
      {/*<DialogContent className={styles.content} dividers>*/}
      {/*  <MaxBox>*/}
      {/*    <Typography variant="body2">*/}
      {/*      {t("tx.issue-resolver-description-1")}{" "}*/}
      {/*      <strong>30 {t("common.minutes-short")}</strong>*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body2" gutterBottom>*/}
      {/*      {t("tx.issue-resolver-description-2")}*/}
      {/*    </Typography>*/}
      {/*    <Box display="flex" justifyContent="center" mb={2}>*/}
      {/*      <FundsChip>{t("tx.issue-resolver-funds-label")}</FundsChip>*/}
      {/*    </Box>*/}
      {/*    <Typography variant="body2" color="textSecondary" gutterBottom>*/}
      {/*      {t("tx.issue-resolver-instructions-text")}*/}
      {/*    </Typography>*/}
      {/*  </MaxBox>*/}
      {/*</DialogContent>*/}
      <DialogContent className={styles.content}>
        <MaxBox>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {t("tx.issue-resolver-viewing-deposit-description")}
          </Typography>
        </MaxBox>
        {Boolean(txHash) && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {t("common.renvm-hash-label")}:&nbsp;
            </Typography>
            {/*<Typography variant="body1">*/}
            {/*  <strong>{renVMHash}</strong>*/}
            {/*</Typography>*/}
            <CopyContentTypography
              content={txHash || ""}
              copiedMessage={t("common.copied-ex-message")}
            />
          </Box>
        )}
        <ActionButtonWrapper>
          <Typography color="textPrimary">
            <Link
              href={links.REN_EXPLORER_GUIDE}
              {...externalLinkAttributes}
              color="primary"
              underline="hover"
            >
              {t("tx.issue-resolver-guide-label")}
            </Link>
          </Typography>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton href={explorer} {...externalLinkAttributes}>
            {t("tx.issue-resolver-go-to-explorer-label")}
          </ActionButton>
        </ActionButtonWrapper>
        <Box mt={4}>
          <Typography color="textSecondary" variant="body2">
            {t("tx.issue-resolver-unresolved-text")}{" "}
            <Link href={links.BUGS_LOG} {...externalLinkAttributes}>
              {t("tx.issue-resolver-unresolved-link-text")}
            </Link>
          </Typography>
        </Box>
      </DialogContent>
      <Debug it={{ txHash }} />
    </WideDialog>
  );
};

const IssueFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  right: 16,
  bottom: 48,
  [theme.breakpoints.up("sm")]: {
    right: 48,
  },
  "@media (min-width: 1280px)": {
    right: `calc((100% - 1280px)/2 + 48px)`,
  },
}));

type IssuesResolverButtonProps = {
  mode?: "menu" | "fab";
  className?: string;
};

export const IssuesResolverButton: FunctionComponent<
  IssuesResolverButtonProps
> = ({ mode = "menu", className }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { dialogOpened: issueResolverOpened } = useSelector($issueResolver);
  const { currentTxHash } = useSelector($transactions);
  const handleIssueResolverToggle = useCallback(() => {
    dispatch(setIssueResolverOpened(!issueResolverOpened));
  }, [dispatch, issueResolverOpened]);

  const buttonTitle = t("tx.issue-resolver-button-title");

  if (mode === "fab") {
    return (
      <IssueFab
        size="small"
        color="primary"
        onClick={handleIssueResolverToggle}
        title={buttonTitle}
      >
        <Feedback fontSize="small" />
      </IssueFab>
    );
  }
  return (
    <Fade in={!!currentTxHash}>
      <ClosableMenuIconButton
        title={buttonTitle}
        className={className}
        Icon={IssueResolverIcon}
        opened={issueResolverOpened}
        onClick={handleIssueResolverToggle}
      />
    </Fade>
  );
};
