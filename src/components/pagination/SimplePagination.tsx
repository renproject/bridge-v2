import {
  Box,
  TablePagination,
  TablePaginationProps,
  useTheme,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import React, { FunctionComponent } from "react";
import { NavigateNextIcon, NavigatePrevIcon } from "../icons/RenIcons";

const useSimplePaginationActionsStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  button: {
    color: theme.palette.common.black,
  },
}));

type TablePaginationActionsProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
};

function SimplePaginationActions(props: TablePaginationActionsProps) {
  const styles = useSimplePaginationActionsStyles();
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={styles.root}>
      <IconButton
        className={styles.button}
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        className={styles.button}
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        className={styles.button}
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        className={styles.button}
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

const useSimplestPaginationActionsStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
  },
  button: {
    padding: 1,
    fontSize: 16,
    marginTop: -3,
    color: theme.palette.common.black,
  },
}));

function SimplestPaginationActions(props: TablePaginationActionsProps) {
  const styles = useSimplestPaginationActionsStyles();
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  return (
    <div className={styles.root}>
      <IconButton
        className={styles.button}
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <NavigateNextIcon fontSize="inherit" />
        ) : (
          <NavigatePrevIcon fontSize="inherit" />
        )}
      </IconButton>
      <IconButton
        className={styles.button}
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <NavigatePrevIcon fontSize="inherit" />
        ) : (
          <NavigateNextIcon fontSize="inherit" />
        )}
      </IconButton>
    </div>
  );
}

const useSimplePaginationStyles = makeStyles((theme) => ({
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    minHeight: 24,
    paddingRight: 0,
    paddingLeft: 0,
    "&:nth-child(2)": {
      display: "none",
    },
  },
  spacer: {
    display: "none",
  },
  caption: {
    fontSize: 14,
    marginRight: 2,
  },
}));

export const SimplePagination: FunctionComponent<TablePaginationProps> = (
  props
) => {
  const classes = useSimplePaginationStyles();
  return (
    <TablePagination
      component={Box}
      classes={classes}
      rowsPerPageOptions={[4]}
      ActionsComponent={SimplePaginationActions}
      {...props}
    />
  );
};

const simplestDisplayedRows = ({
  count,
  page,
}: {
  count: number;
  page: number;
}) => `${page + 1} of ${count}`;

const useSimplestPaginationStyles = makeStyles((theme) => ({
  toolbar: {
    display: "inline-flex",
    justifyContent: "space-between",
    minHeight: 16,
    paddingRight: 0,
    paddingLeft: 0,
    "&:nth-child(2)": {
      display: "none",
    },
  },
  spacer: {
    display: "none",
  },
  caption: {
    fontSize: 12,
  },
}));

export const SimplestPagination: FunctionComponent<TablePaginationProps> = ({
  rowsPerPage,
  ...props
}) => {
  const classes = useSimplestPaginationStyles();
  return (
    <TablePagination
      component={Box}
      classes={classes}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[rowsPerPage]}
      labelRowsPerPage={<></>}
      labelDisplayedRows={simplestDisplayedRows}
      ActionsComponent={SimplestPaginationActions}
      {...props}
    />
  );
};

const useShowEntryStyles = makeStyles({
  show: {},
  hide: {
    display: "none",
  },
});

type ShowEntryProps = {
  when: boolean;
};

export const ShowEntry: FunctionComponent<ShowEntryProps> = ({
  when,
  children,
}) => {
  const styles = useShowEntryStyles();
  return <div className={when ? styles.show : styles.hide}>{children}</div>;
};
