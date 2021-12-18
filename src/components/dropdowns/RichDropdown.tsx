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

export type GetOptionDataFn = (option: string) => OptionData;

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
  multipleNames?: boolean;
  balances?: Array<DropdownAssetBalance>;
  getAssetBalance?: GetAssetBalanceFn;
  condensed?: boolean;
  label?: string;
  supplementalLabel?: string;
};

const getOptionDataDefault: GetOptionDataFn = (option) => {
  let full = "Select";
  let short = "Select";
  let Icon = EmptyCircleIcon;

  return { value: option, fullName: full, shortName: short, Icon };
};

const getAssetBalanceDefault: GetAssetBalanceFn = (option, balances = []) => {
  const entry = balances.find((entry) => entry.asset === option);
  return entry?.balance || null;
};

export const RichDropdown: FunctionComponent<RichDropdownProps> = ({
  multipleNames = true,
  options = [],
  getOptionData = getOptionDataDefault,
  condensed = false,
  label,
  balances = [],
  getAssetBalance = getAssetBalanceDefault,
  supplementalLabel = "Options",
  ...rest
}) => {
  const styles = useRichDropdownStyles();
  const condensedSelectClasses = useCondensedSelectStyles();

  const valueRenderer = useMemo(
    () => (option: any) => {
      const { Icon, fullName, shortName } = getOptionData(option);
      // const selected = false;
      return (
        <Box display="flex" alignItems="center" width="100%">
          {!condensed && (
            <Box width="37%">
              <Typography variant="body2" className={styles.supplementalText}>
                {label}
              </Typography>
            </Box>
          )}
          <Box width="45px" display="flex" alignItems="center">
            <Icon className={styles.listIcon} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body2">
              {multipleNames ? shortName : fullName}
            </Typography>
          </Box>
        </Box>
      );
    },
    [multipleNames, styles, label, condensed, getOptionData]
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
        {...rest}
      >
        <ListSubheader className={styles.listSubheader}>
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
          .map((option) => getOptionData(option))
          .map(({ value, Icon, fullName, shortName }) => {
            return (
              <MenuItem key={value} value={value}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="45px" className={styles.iconWrapper}>
                    <Icon className={styles.listIcon} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1" className={styles.assetName}>
                      {multipleNames ? shortName : fullName}
                    </Typography>
                    {multipleNames && (
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
