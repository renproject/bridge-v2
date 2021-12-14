import { Asset } from "@renproject/chains";
import {
  GetOptionDataFn,
  OptionData,
} from "../../../components/dropdowns/RichDropdown";
import { EmptyCircleIcon } from "../../../components/icons/RenIcons";
import { getAssetConfig } from "../../../utils/tokensConfig";

export const getAssetOptionData: GetOptionDataFn = (name: string) => {
  if (!name) {
    return {
      Icon: EmptyCircleIcon,
      fullName: "Select",
      shortName: "Select",
      value: name,
    };
  }
  const config = getAssetConfig(name as Asset);
  const { Icon, fullName, shortName } = config;

  return {
    Icon,
    fullName,
    shortName,
    value: name,
  } as OptionData;
};
