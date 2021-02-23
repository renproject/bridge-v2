import { RenNetwork } from "@renproject/interfaces";
import { BinanceSmartChainInjectedConnector } from "@renproject/multiwallet-binancesmartchain-injected-connector";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { EthereumMEWConnectConnector } from "@renproject/multiwallet-ethereum-mewconnect-connector";
import { EthereumWalletConnectConnector } from "@renproject/multiwallet-ethereum-walletconnect-connector";
import { MultiwalletProvider as RenMultiwalletProvider } from "@renproject/multiwallet-ui";
import React, { FunctionComponent } from "react";
import { BinanceMetamaskConnectorInfo } from "../../components/wallet/WalletHelpers";
import { env } from "../../constants/environmentVariables";
import { featureFlags } from "../../constants/featureFlags";
import { RenChain } from "../../utils/assetConfigs";

const networkMapping: Record<number, RenNetwork> = {
  1: RenNetwork.Mainnet,
  4: RenNetwork.TestnetVDot3,
  42: RenNetwork.Testnet,
};

export const renNetworkToEthNetwork = (id: RenNetwork): number | undefined => {
  const entry = Object.entries(networkMapping).find(([_, x]) => x === id);
  if (!entry) return entry;
  return parseInt(entry[0]);
};

export const ethNetworkToRenNetwork = (id: string | number): RenNetwork => {
  const index = Number(id);
  return networkMapping[index];
};

export const walletPickerModalConfig = (targetEthChainId: number) => ({
  chains: {
    [RenChain.ethereum]: [
      {
        name: "Metamask",
        logo: "https://avatars1.githubusercontent.com/u/11744586?s=60&v=4s",
        connector: new EthereumInjectedConnector({
          debug: env.DEV,
          networkIdMapper: ethNetworkToRenNetwork,
        }),
      },
      ...(featureFlags.enableMEWConnect
        ? [
            {
              name: "MEW",
              logo:
                "https://avatars1.githubusercontent.com/u/24321658?s=60&v=4s",
              connector: new EthereumMEWConnectConnector({
                debug: env.DEV,
                rpc: {
                  42: `wss://kovan.infura.io/ws/v3/${env.INFURA_KEY}`,
                  1: `wss://mainnet.infura.io/ws/v3/${env.INFURA_KEY}`,
                },
                chainId: targetEthChainId,
              }),
            },
          ]
        : []),
      ...(featureFlags.enableWalletConnect
        ? [
            {
              name: "WalletConnect",
              logo:
                "https://avatars0.githubusercontent.com/u/37784886?s=60&v=4",
              connector: new EthereumWalletConnectConnector({
                rpc: {
                  42: `https://kovan.infura.io/v3/${env.INFURA_KEY}`,
                  1: `wss://mainnet.infura.io/ws/v3/${env.INFURA_KEY}`,
                },
                qrcode: true,
                debug: true,
              }),
            },
          ]
        : []),
    ],
    [RenChain.binanceSmartChain]: [
      {
        name: "BinanceSmartWallet",
        logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
        connector: new BinanceSmartChainInjectedConnector({ debug: true }),
      },
      // TODO: move this config into its own connector?

      ...(featureFlags.enableBSCMetamask
        ? [
            {
              name: "Metamask",
              logo:
                "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
              info: BinanceMetamaskConnectorInfo,
              connector: (() => {
                const connector = new BinanceSmartChainInjectedConnector({
                  debug: true,
                });
                connector.getProvider = () => (window as any).ethereum;
                return connector;
              })(),
            },
          ]
        : []),
    ],
  },
});

export const MultiwalletProvider: FunctionComponent = ({ children }) => {
  return <RenMultiwalletProvider>{children}</RenMultiwalletProvider>;
};
