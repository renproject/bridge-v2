import { Chain } from "@renproject/chains";
import { BinanceSmartChainInjectedConnector } from "@renproject/multiwallet-binancesmartchain-injected-connector";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { EthereumMEWConnectConnector } from "@renproject/multiwallet-ethereum-mewconnect-connector";
// import { SolanaConnector } from "@renproject/multiwallet-solana-connector";
import { RenNetwork } from "@renproject/utils";
import { env } from "../../constants/environmentVariables";
import {
  ArbitrumMetamaskConnectorInfo,
  AvalancheMetamaskConnectorInfo,
  BinanceMetamaskConnectorInfo,
  FantomMetamaskConnectorInfo,
  PolygonMetamaskConnectorInfo,
} from "../../features/wallet/components/WalletHelpers";
import { createNetworkIdMapper } from "../../utils/networksConfig";
import { Wallet } from "../../utils/walletsConfig";
import { SolanaConnector } from "./SolanaConnector";

const isEnabled = (chain: Chain, wallet: Wallet) => {
  const entries = env.ENABLED_EXTRA_WALLETS;
  if (entries.length === 1 && entries[0] === "*") {
    return true;
  }
  for (const entry of entries) {
    const [chainSymbol, wallets] = entry.split("/");
    if (chainSymbol === chain) {
      if (wallets === "*") {
        return true;
      } else {
        const walletSymbols = wallets.split("|");
        //return true/false only if chain info present and wallet enumerated;
        return walletSymbols.includes(wallet);
      }
    }
  }
  return false;
};

export const getMultiwalletConfig = (network: RenNetwork, reinit = false) => {
  return {
    chains: {
      [Chain.Ethereum]: [
        {
          name: Wallet.MetaMask,
          logo: "",
          connector: new EthereumInjectedConnector({
            debug: env.DEV,
            networkIdMapper: createNetworkIdMapper(Chain.Ethereum),
          }),
        },
        ...(isEnabled(Chain.Ethereum, Wallet.MyEtherWallet)
          ? [
              {
                name: Wallet.MyEtherWallet,
                logo: "",
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
        // ...(isEnabled(Chain.Ethereum, Wallet.Coinbase)
        //   ? [
        //       {
        //         name: Wallet.Coinbase,
        //         logo: "",
        //         connector: new CoinbaseInjectedConnector({
        //           debug: env.DEV,
        //           networkIdMapper: createNetworkIdMapper(Chain.Ethereum),
        //         }),
        //       },
        //     ]
        //   : []),
      ],
      // ...(isEnabled(Chain.Ethereum, Wallet.WalletConnect)
      //   ? [
      //       {
      //         name: Wallet.WalletConnect,
      //         logo: "",
      //         connector: new EthereumWalletConnectConnector({
      //           rpc: {
      //             42: `https://kovan.infura.io/v3/${env.INFURA_ID}`,
      //             1: `wss://mainnet.infura.io/ws/v3/${env.INFURA_ID}`,
      //           },
      //           qrcode: true,
      //           debug: true,
      //         }),
      //       },
      //     ]
      //   : []),
      // [Chain.Goerli]: [
      //   {
      //     name: Wallet.MetaMask,
      //     logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
      //     info: PolygonMetamaskConnectorInfo,
      //     connector: (() => {
      //       const connector = new EthereumInjectedConnector({
      //         networkIdMapper: createNetworkIdMapper(Chain.Goerli),
      //         debug: true,
      //       });
      //       connector.getProvider = () => (window as any).ethereum;
      //       return connector;
      //     })(),
      //   },
      // ],
      [Chain.Fantom]: [
        {
          name: Wallet.MetaMask,
          logo: "",
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
          logo: "",
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
          logo: "",
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
          logo: "",
          connector: new BinanceSmartChainInjectedConnector({ debug: true }),
        },
        // TODO: move this config into its own connector?
        ...(isEnabled(Chain.BinanceSmartChain, Wallet.MetaMask)
          ? [
              {
                name: Wallet.MetaMask,
                logo: "",
                info: BinanceMetamaskConnectorInfo,
                connector: (() => {
                  const connector = new BinanceSmartChainInjectedConnector({
                    debug: true,
                    networkIdMapper: createNetworkIdMapper(
                      Chain.BinanceSmartChain
                    ),
                  });
                  connector.getProvider = () => (window as any).ethereum;
                  return connector;
                })(),
              },
            ]
          : []),
      ],
      [Chain.Solana]: [
        {
          name: Wallet.Phantom,
          logo: "",
          connector: new SolanaConnector({
            debug: true,
            providerURL: (window as any).solana || "https://www.phantom.app",
            clusterURL:
              network === RenNetwork.Mainnet
                ? "https://ren.rpcpool.com/"
                : undefined,
            network,
          }),
        },
        {
          name: Wallet.Sollet,
          logo: "",
          connector: new SolanaConnector({
            providerURL: "https://www.sollet.io",
            clusterURL:
              network === RenNetwork.Mainnet
                ? "https://ren.rpcpool.com/"
                : undefined,
            network,
          }),
        },
      ],
      [Chain.Arbitrum]: [
        {
          name: Wallet.MetaMask,
          logo: "",
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
