import { RenNetwork } from '@renproject/interfaces'
import RenJS from '@renproject/ren'
import { env } from '../constants/environmentVariables'

let renJs: RenJS | null = null;

export const getRenJs = () => {
  if (renJs === null) {
    renJs = new RenJS(env.TARGET_NETWORK as RenNetwork);
  }
  return renJs;
};
