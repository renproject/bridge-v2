import { RenNetwork } from '@renproject/interfaces'
import { useMultiwallet } from '@renproject/multiwallet-ui'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { WalletConnectionStatusType, WalletStatus, } from '../../components/utils/types'
import { $renNetwork } from '../../features/network/networkSlice'
import { $multiwalletChain } from '../../features/wallet/walletSlice'
import { BridgeWallet } from '../../utils/assetConfigs'

type WalletData = {
  account: string;
  status: WalletConnectionStatusType;
  walletConnected: boolean;
  provider: any;
  symbol: BridgeWallet;
  targetNetwork: RenNetwork;
  setTargetNetwork: (n: RenNetwork) => void;
};

const resolveWallet = (provider: any) => {
  if (provider?.isMetaMask) {
    return BridgeWallet.METAMASKW;
  } else if (
    provider?.chainId === "0x61" ||
    provider?.chainId.indexOf("Binance")
  ) {
    return BridgeWallet.BINANCESMARTW;
  }
  return BridgeWallet.UNKNOWNW;
};

type UseWallet = (chain: string) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const {
    enabledChains,
    targetNetwork,
    activateConnector,
    setTargetNetwork,
  } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const symbol = resolveWallet(provider);

  return {
    account,
    status,
    walletConnected: status === WalletStatus.CONNECTED,
    provider,
    symbol,
    targetNetwork,
    enabledChains,
    activateConnector,
    setTargetNetwork,
  } as WalletData;
};

export const useSelectedChainWallet = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  return useWallet(multiwalletChain);
};

export const useSyncMultiwalletNetwork = () => {
  const { targetNetwork, setTargetNetwork } = useSelectedChainWallet();
  const renNetwork = useSelector($renNetwork);
  useEffect(() => {
    if (renNetwork !== targetNetwork) {
      console.log("syncing multiwallet with network", renNetwork);
      setTargetNetwork(renNetwork);
    }
  }, [renNetwork, setTargetNetwork, targetNetwork]);
};
