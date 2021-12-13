import {
  GetOptionDataFn,
  OptionData,
} from "../../../components/dropdowns/RichDropdown";
import { getCurrencyConfigByRentxName } from "../../../utils/assetConfigs";

export const getAssetOptionData: GetOptionDataFn = (name) => {
  const asset = getCurrencyConfigByRentxName(name);
  const { Icon, full, short } = asset;

  const data: OptionData = {
    Icon,
    full,
    short,
    value: name,
  };

  return data;
};
