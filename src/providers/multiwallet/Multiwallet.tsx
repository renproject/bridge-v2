import { Chain } from "@renproject/chains";
import { RenNetwork } from "@renproject/utils";
import { BinanceSmartChainInjectedConnector } from "@renproject/multiwallet-binancesmartchain-injected-connector";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { EthereumMEWConnectConnector } from "@renproject/multiwallet-ethereum-mewconnect-connector";
import { EthereumWalletConnectConnector } from "@renproject/multiwallet-ethereum-walletconnect-connector";
import { MultiwalletProvider as RenMultiwalletProvider } from "@renproject/multiwallet-ui";
import React, { FunctionComponent } from "react";
import { env } from "../../constants/environmentVariables";
import { featureFlags } from "../../constants/featureFlags";
import {
  ArbitrumMetamaskConnectorInfo,
  AvalancheMetamaskConnectorInfo,
  BinanceMetamaskConnectorInfo,
  FantomMetamaskConnectorInfo,
  PolygonMetamaskConnectorInfo,
} from "../../features/wallet/components/WalletHelpers";
import { createNetworkIdMapper } from "../../utils/networksConfig";
import { Wallet } from "../../utils/walletsConfig";

export const walletPickerModalConfig = (network: RenNetwork) => {
  return {
    chains: {
      [Chain.Ethereum]: [
        {
          name: Wallet.MetaMask,
          logo: "https://avatars1.githubusercontent.com/u/11744586?s=60&v=4s",
          connector: new EthereumInjectedConnector({
            debug: env.DEV,
            networkIdMapper: createNetworkIdMapper(Chain.Ethereum),
          }),
        },
        ...(featureFlags.enableMEWConnect
          ? [
              {
                name: Wallet.MewConnect,
                logo: "https://avatars1.githubusercontent.com/u/24321658?s=60&v=4s",
                connector: new EthereumMEWConnectConnector({
                  debug: env.DEV,
                  rpc: {
                    42: `wss://kovan.infura.io/ws/v3/${env.INFURA_ID}`,
                    1: `wss://mainnet.infura.io/ws/v3/${env.INFURA_ID}`,
                  },
                  chainId: network === RenNetwork.Mainnet ? 1 : 42,
                }),
              },
            ]
          : []),
        ...(featureFlags.enableWalletConnect
          ? [
              {
                name: Wallet.WalletConnect,
                logo: "https://avatars0.githubusercontent.com/u/37784886?s=60&v=4",
                connector: new EthereumWalletConnectConnector({
                  rpc: {
                    42: `https://kovan.infura.io/v3/${env.INFURA_ID}`,
                    1: `wss://mainnet.infura.io/ws/v3/${env.INFURA_ID}`,
                  },
                  qrcode: true,
                  debug: true,
                }),
              },
            ]
          : []),
      ],
      [Chain.Fantom]: [
        {
          name: Wallet.MetaMask,
          logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
          info: FantomMetamaskConnectorInfo,
          connector: (() => {
            const connector = new EthereumInjectedConnector({
              networkIdMapper: createNetworkIdMapper(Chain.Fantom),
              debug: true,
            });
            connector.getProvider = () => (window as any).ethereum;
            return connector;
          })(),
        },
      ],
      [Chain.Polygon]: [
        {
          name: Wallet.MetaMask,
          logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
          info: PolygonMetamaskConnectorInfo,
          connector: (() => {
            const connector = new EthereumInjectedConnector({
              networkIdMapper: createNetworkIdMapper(Chain.Polygon),
              debug: true,
            });
            connector.getProvider = () => (window as any).ethereum;
            return connector;
          })(),
        },
      ],
      [Chain.Avalanche]: [
        {
          name: Wallet.MetaMask,
          logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
          info: AvalancheMetamaskConnectorInfo,
          connector: (() => {
            const connector = new EthereumInjectedConnector({
              networkIdMapper: createNetworkIdMapper(Chain.Avalanche),
              debug: true,
            });
            connector.getProvider = () => (window as any).ethereum;
            return connector;
          })(),
        },
      ],
      [Chain.BinanceSmartChain]: [
        {
          name: Wallet.BinanceSmartChain,
          logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
          connector: new BinanceSmartChainInjectedConnector({ debug: true }),
        },
        // TODO: move this config into its own connector?
        ...(featureFlags.enableBSCMetamask || true
          ? [
              {
                name: Wallet.MetaMask,
                logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
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
      // [Chain.Solana]: [
      //   {
      //     name: "Phantom",
      //     logo: "https://avatars1.githubusercontent.com/u/78782331?s=60&v=4",
      //     connector: new SolanaConnector({
      //       debug: true,
      //       providerURL: (window as any).solana || "https://www.phantom.app",
      //       clusterURL:
      //         network === RenNetwork.Mainnet
      //           ? "https://ren.rpcpool.com/"
      //           : undefined,
      //       network,
      //     }),
      //   },
      //   {
      //     name: "Sollet.io",
      //     logo: "https://avatars1.githubusercontent.com/u/69240779?s=60&v=4",
      //     connector: new SolanaConnector({
      //       providerURL: "https://www.sollet.io",
      //       clusterURL:
      //         network === RenNetwork.Mainnet
      //           ? "https://ren.rpcpool.com/"
      //           : undefined,
      //       network,
      //     }),
      //   },
      // ],
      [Chain.Arbitrum]: [
        {
          name: Wallet.MetaMask,
          logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
          info: ArbitrumMetamaskConnectorInfo,
          connector: (() => {
            const connector = new EthereumInjectedConnector({
              networkIdMapper: createNetworkIdMapper(Chain.Arbitrum),
              debug: true,
            });
            connector.getProvider = () => (window as any).ethereum;
            return connector;
          })(),
        },
      ],
    },
  };
};

export const MultiwalletProvider: FunctionComponent = ({ children }) => {
  return <RenMultiwalletProvider>{children}</RenMultiwalletProvider>;
};
