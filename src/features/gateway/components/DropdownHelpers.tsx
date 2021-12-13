import {
  GetOptionDataFn,
  OptionData,
} from "../../../components/dropdowns/RichDropdown";
import { getCurrencyConfigByRentxName } from "../../../utils/assetConfigs";
import { allAssetChains } from "../../../utils/chainsConfig";

console.log(allAssetChains);

export const getAssetOptionData: GetOptionDataFn = (name) => {
  const asset = getCurrencyConfigByRentxName(name);
  const { Icon, full, short } = asset;

  const data: OptionData = {
    Icon,
    fullName: full,
    shortName: short,
    value: name,
  };

  return data;
};
