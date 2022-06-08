import { Asset, Chain } from "@renproject/chains";
import {
  GetOptionDataFn,
  OptionData,
} from "../../../components/dropdowns/RichDropdown";
import { EmptyCircleIcon } from "../../../components/icons/RenIcons";
import { getChainConfig } from "../../../utils/chainsConfig";
import {
  getAssetConfig,
  getRenAssetFullName,
  getRenAssetName,
} from "../../../utils/assetsConfig";

export const getAssetOptionData: GetOptionDataFn = (name: string, props) => {
  if (!name) {
    return {
      Icon: EmptyCircleIcon,
      fullName: props.noneLabel || props.label || "Select",
      shortName: props.noneLabel || props.label || "Select",
      value: name,
    };
  }
  const config = getAssetConfig(name as Asset);
  const { fullName, shortName } = config;
  const wrappedAsset = props.optionMode;
  return {
    Icon: wrappedAsset ? config.RenIcon : config.Icon,
    fullName: wrappedAsset ? getRenAssetFullName(fullName) : fullName,
    shortName: wrappedAsset ? getRenAssetName(shortName) : shortName,
    value: name,
  } as OptionData;
};

export const getChainOptionData: GetOptionDataFn = (name: string, props) => {
  if (!name) {
    return {
      Icon: EmptyCircleIcon,
      fullName: props.noneLabel || props.label || "Select",
      shortName: props.noneLabel || props.label || "Select",
      value: name,
    };
  }
  const config = getChainConfig(name as Chain);
  const { Icon, fullName } = config;

  return {
    Icon,
    fullName,
    shortName: fullName,
    value: name,
  } as OptionData;
};
