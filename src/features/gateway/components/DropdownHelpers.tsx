import { Asset, Chain } from "@renproject/chains";
import {
  GetOptionDataFn,
  OptionData,
} from "../../../components/dropdowns/RichDropdown";
import { EmptyCircleIcon } from "../../../components/icons/RenIcons";
import { getChainConfig } from "../../../utils/chainsConfig";
import { getAssetConfig } from "../../../utils/tokensConfig";

export const getAssetOptionData: GetOptionDataFn = (
  name: string,
  wrappedAsset = false
) => {
  if (!name) {
    return {
      Icon: EmptyCircleIcon,
      fullName: "Select",
      shortName: "Select",
      value: name,
    };
  }
  const config = getAssetConfig(name as Asset);
  const { fullName, shortName } = config;

  return {
    Icon: wrappedAsset ? config.RenIcon : config.Icon,
    fullName,
    shortName: wrappedAsset ? "kuwa" : shortName,
    value: name,
  } as OptionData;
};

export const getChainOptionData: GetOptionDataFn = (name: string) => {
  if (!name) {
    return {
      Icon: EmptyCircleIcon,
      fullName: "Select",
      shortName: "Select",
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
