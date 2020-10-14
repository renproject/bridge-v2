import { Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { Link } from "../links/Links";
import { TransactionStatusIndicator } from "../progress/ProgressHelpers";

type TransactionType = "mint" | "release";
type TransactionStatus = "pending" | "complete";

export type Transaction = {
  date: string;
  time: string;
  type: TransactionType;
  status: TransactionStatus;
};

const standardPaddings = {
  paddingTop: 20,
  paddingLeft: 30,
  paddingRight: 30,
};

const useTransactionsHeaderStyles = makeStyles((theme) => ({
  root: {
    ...standardPaddings,
    background: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  subtitle: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

type TransactionsHeaderProps = {
  title?: string;
  subtitle: string;
};

export const TransactionsHeader: FunctionComponent<TransactionsHeaderProps> = ({
  title,
  subtitle,
}) => {
  const styles = useTransactionsHeaderStyles();
  return (
    <div className={styles.root}>
      {title && <Typography variant="h6">{title}</Typography>}
      <Typography variant="overline" className={styles.subtitle}>
        {subtitle}
      </Typography>
    </div>
  );
};

const useTransactionEntryStyles = makeStyles((theme) => ({
  root: {
    ...standardPaddings,
    paddingBottom: 20,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  details: {},
  datetime: {},
  date: {
    marginRight: 6,
  },
  description: {
    marginTop: 3,
    marginBottom: 3,
  },
  links: {},
  link: {
    marginRight: 24,
    "&:last-child": {
      marginRight: 0,
    },
  },
  status: {},
}));

export const TransactionEntry: FunctionComponent<any> = () => {
  const styles = useTransactionEntryStyles();
  return (
    <div className={styles.root}>
      <div className={styles.details}>
        <div className={styles.datetime}>
          <Chip size="small" label="04/02/20" className={styles.date} />
          <Chip size="small" label="23:45:32 UTC" />
        </div>
        <div className={styles.description}>
          <Typography variant="body2">
            Mint 0.9877 renBTC on Ethereum
          </Typography>
        </div>
        <div className={styles.links}>
          <Link href="" external color="primary" className={styles.link}>
            Bitcoin transaction
          </Link>
          <Link href="" external color="primary" className={styles.link}>
            Ethereum transaction
          </Link>
        </div>
      </div>
      <div className={styles.status}>
        <TransactionStatusIndicator />
      </div>
    </div>
  );
};

export const TransactionsGrid: FunctionComponent<any> = () => {
  const pending = 2;
  // const completed = 2;
  return (
    <div>
      <TransactionsHeader
        title="Transactions"
        subtitle={`Pending (${pending})`}
      />
      <div>
        <TransactionEntry />
        <TransactionEntry />
      </div>
    </div>
  );
};
