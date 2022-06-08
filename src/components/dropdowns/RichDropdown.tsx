import {
  Box,
  ListSubheader,
  MenuItem,
  Select,
  SelectProps,
  styled,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent, useMemo } from "react";
import { NumberFormatText } from "../formatting/NumberFormatText";
import { CustomSvgIconComponent, EmptyCircleIcon } from "../icons/RenIcons";

const iconStyles = {
  width: 32,
  height: 32,
  fontSize: 32,
};
const useCondensedSelectStyles = makeStyles(() => ({
  select: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
  },
}));

const useRichDropdownStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  inputRoot: {
    width: "100%",
  },
  supplementalText: {
    fontSize: 12,
  },
  iconWrapper: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  },
  listItemCondensed: {
    // paddingLeft: 4,
    paddingRight: 10,
  },
  listIcon: iconStyles,
  assetName: {
    fontSize: 13,
  },
  assetFullName: {
    fontSize: 11,
  },
  balance: {
    fontSize: 12,
  },
  listSubheader: {
    background: theme.palette.background.paper,
    pointerEvents: "none",
    fontSize: 10,
    lineHeight: 1,
  },
  listSubheaderLabel: {
    fontSize: 10,
  },
}));

export type OptionData = {
  value: string;
  shortName: string;
  fullName: string;
  Icon: CustomSvgIconComponent;
};

export type GetOptionDataFn = (
  option: string,
  props: Partial<RichDropdownProps>
) => OptionData;

export type DropdownAssetBalance = {
  asset: string;
  balance: number;
};

export type GetAssetBalanceFn = (
  option: string,
  balances?: Array<DropdownAssetBalance>
) => number | null;

type RichDropdownProps = SelectProps & {
  options?: Array<string>;
  getOptionData?: GetOptionDataFn;
  optionMode?: boolean;
  nameVariant?: "multiple" | "short" | "full";
  balances?: Array<DropdownAssetBalance>;
  getAssetBalance?: GetAssetBalanceFn;
  condensed?: boolean;
  label?: string;
  supplementalLabel?: string;
  showNone?: boolean;
  noneLabel?: string;
};

const getOptionDataDefault: GetOptionDataFn = (option, props) => {
  let fullName = "Select";
  let shortName = "Select";
  let Icon = EmptyCircleIcon;

  return { value: option, fullName, shortName, Icon };
};

const getAssetBalanceDefault: GetAssetBalanceFn = (option, balances = []) => {
  const entry = balances.find((entry) => entry.asset === option);
  return entry?.balance || null;
};

export const RichDropdown: FunctionComponent<RichDropdownProps> = ({
  nameVariant = "multiple",
  options = [],
  getOptionData = getOptionDataDefault,
  condensed = false,
  label,
  balances = [],
  getAssetBalance = getAssetBalanceDefault,
  supplementalLabel,
  optionMode = false,
  value,
  showNone = false,
  noneLabel,
  ...rest
}) => {
  const styles = useRichDropdownStyles();
  const condensedSelectClasses = useCondensedSelectStyles();
  const listItemClassName = condensed ? styles.listItemCondensed : undefined;
  const valueRenderer = useMemo(
    () => (option: any) => {
      const { Icon, fullName, shortName } = getOptionData(option, {
        optionMode,
        label,
      });
      // const selected = false;
      return (
        <Box display="flex" alignItems="center" width="100%">
          {!condensed && (
            <Box width="34%">
              <Typography variant="body2" className={styles.supplementalText}>
                {label}
              </Typography>
            </Box>
          )}
          <Box width={condensed ? 35 : 45} display="flex" alignItems="center">
            <Icon className={styles.listIcon} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body2">
              {nameVariant === "multiple"
                ? shortName
                : nameVariant === "short"
                ? shortName
                : fullName}
            </Typography>
          </Box>
        </Box>
      );
    },
    [nameVariant, styles, label, condensed, getOptionData, optionMode]
  );
  return (
    <div>
      <Select
        variant="outlined"
        className={condensed ? undefined : styles.inputRoot}
        classes={condensed ? condensedSelectClasses : undefined}
        renderValue={valueRenderer}
        displayEmpty
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        value={value}
        {...rest}
      >
        {showNone && (
          <MenuItem
            value=""
            selected={value === ""}
            disableGutters={condensed}
            className={listItemClassName}
          >
            <Box display="flex" alignItems="center" width="100%">
              <Box width="45px" className={styles.iconWrapper}>
                <EmptyCircleIcon className={styles.listIcon} />
              </Box>
              <Box flexGrow={1}>
                <Typography variant="body1" className={styles.assetName}>
                  {noneLabel}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        )}
        <ListSubheader
          className={classNames(styles.listSubheader, listItemClassName)}
          disableGutters={condensed}
        >
          <Box display="flex" alignItems="center" width="100%">
            <Box width="45px" />
            <Box flexGrow={1}>
              <Typography
                variant="overline"
                className={styles.listSubheaderLabel}
              >
                {supplementalLabel}
              </Typography>
            </Box>
            {balances && balances.length > 0 && (
              <Box flexGrow={1} textAlign="right">
                <Typography
                  variant="overline"
                  className={styles.listSubheaderLabel}
                >
                  Your Balance
                </Typography>
              </Box>
            )}
          </Box>
        </ListSubheader>
        {options
          .map((option) => getOptionData(option, { optionMode }))
          .map(({ value, Icon, fullName, shortName }) => {
            return (
              <MenuItem
                key={value}
                value={value}
                disableGutters={condensed}
                className={listItemClassName}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="45px" className={styles.iconWrapper}>
                    <Icon className={styles.listIcon} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1" className={styles.assetName}>
                      {nameVariant === "multiple"
                        ? shortName
                        : nameVariant === "short"
                        ? shortName
                        : fullName}
                    </Typography>
                    {nameVariant === "multiple" && (
                      <Typography
                        color="textSecondary"
                        className={styles.assetFullName}
                      >
                        {fullName}
                      </Typography>
                    )}
                  </Box>
                  {balances.length > 0 && (
                    <Box
                      flexGrow={1}
                      textAlign="right"
                      className={styles.balance}
                    >
                      <NumberFormatText
                        value={getAssetBalance(value, balances)}
                      />
                    </Box>
                  )}
                </Box>
              </MenuItem>
            );
          })}
      </Select>
    </div>
  );
};

export const RichDropdownWrapper = styled("div")({
  marginTop: 10,
});
