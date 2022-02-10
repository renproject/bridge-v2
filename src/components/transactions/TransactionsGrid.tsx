import { styled, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { TransactionStatusType } from "../utils/types";

type TransactionType = "mint" | "release";

export type Transaction = {
  date: string;
  time: string;
  type: TransactionType;
  status: TransactionStatusType;
};

const standardPaddings = {
  paddingLeft: 40,
  paddingRight: 40,
};

const standardShadow = `0px 0px 4px rgba(0, 27, 58, 0.1)`;

const useTransactionsHeaderStyles = makeStyles((theme) => ({
  root: {
    ...standardPaddings,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.common.white,
    boxShadow: standardShadow,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {},
  actions: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(2),
  },
}));

export const TransactionsContent = styled("div")(({ theme }) => ({
  ...standardPaddings,
}));

type TransactionsHeaderProps = {
  title?: string;
};

export const TransactionsHeader: FunctionComponent<TransactionsHeaderProps> = ({
  title,
  children,
}) => {
  const styles = useTransactionsHeaderStyles();
  return (
    <div className={styles.root}>
      <Typography variant="h6">{title}</Typography>
      <div className={styles.actions}>{children}</div>
    </div>
  );
};

const useTransactionsStatusHeaderStyles = makeStyles((theme) => ({
  root: {
    ...standardPaddings,
    paddingTop: 12,
    paddingBottom: 6,
    background: theme.customColors.greyHeaderBackground,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    fontWeight: 700,
    lineHeight: 1.2,
  },
}));

export const TransactionsStatusHeader: FunctionComponent<
  TransactionsHeaderProps
> = ({ title }) => {
  const styles = useTransactionsStatusHeaderStyles();
  return (
    <div className={styles.root}>
      {title && (
        <Typography variant="overline" className={styles.title}>
          {title}
        </Typography>
      )}
    </div>
  );
};

export const TransactionsPaginationWrapper = styled("div")(({ theme }) => ({
  ...standardPaddings,
  paddingTop: 10,
  paddingBottom: 10,
  backgroundColor: theme.customColors.greyHeaderBackground,
}));

export const useTransactionEntryStyles = makeStyles((theme) => ({
  root: {
    ...standardPaddings,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    alignSelf: "flex-start",
  },
  datetime: {},
  date: {
    marginRight: 6,
  },
  time: {
    marginRight: 32,
  },
  multiple: {
    display: "inline-flex",
    marginRight: 6,
  },
  multipleLabel: {
    marginRight: 16,
  },
  multiplePagination: {},
  description: {
    marginTop: 3,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
  },
  links: {},
  expired: {
    fontSize: 14,
    display: "inline-block",
    marginRight: 8,
  },
  link: {
    fontSize: 14,
    display: "inline-block",
    marginRight: 24,
    "&:last-child": {
      marginRight: 0,
    },
  },
  tooltipIcon: {
    fontSize: 15,
    marginBottom: -2,
    marginRight: 2,
  },
  actions: {
    flexGrow: 1,
    paddingRight: 20,
    display: "flex",
    justifyContent: "flex-end",
  },
  status: {},
}));
