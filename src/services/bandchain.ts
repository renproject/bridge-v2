import BandChain from '@bandprotocol/bandchain.js'
import { env } from '../constants/environmentVariables'

let bandchainInstance: typeof BandChain | null = null;

export const getBandchain = () => {
  if (bandchainInstance === null) {
    bandchainInstance = new BandChain(env.BANDCHAIN_ENDPOINT);
  }
  return bandchainInstance;
};
