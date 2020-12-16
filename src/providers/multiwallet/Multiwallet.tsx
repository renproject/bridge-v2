import { RenNetwork } from "@renproject/interfaces";
import { BinanceSmartChainInjectedConnector } from "@renproject/multiwallet-binancesmartchain-injected-connector";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { MultiwalletProvider as RenMultiwalletProvider } from "@renproject/multiwallet-ui";
import React, { FunctionComponent } from "react";
import { RenChain } from "../../utils/assetConfigs";

const networkMapping: Record<number, RenNetwork> = {
  1: RenNetwork.Mainnet,
  4: RenNetwork.TestnetVDot3,
  42: RenNetwork.Testnet,
};

export const ethNetworkToRenNetwork = (id: string | number): RenNetwork => {
  const index = Number(id);
  console.log("maping", id, index);
  return networkMapping[index];
};

export const walletPickerModalConfig = {
  chains: {
    [RenChain.ethereum]: [
      {
        name: "Metamask",
        logo: "https://avatars1.githubusercontent.com/u/11744586?s=60&v=4s",
        connector: new EthereumInjectedConnector({
          debug: true,
          networkIdMapper: ethNetworkToRenNetwork,
        }),
      }, //,
      // {
      //   name: "WalletConnect",
      //   logo: "https://avatars0.githubusercontent.com/u/37784886?s=60&v=4",
      //   connector: new EthereumWalletConnectConnector({
      //     rpc: {
      //       42: `https://kovan.infura.io/v3/${env.INFURA_KEY}`,
      //     },
      //     qrcode: true,
      //     debug: true,
      //   }),
      // },
    ],
    [RenChain.binanceSmartChain]: [
      {
        name: "BinanceSmartWallet",
        logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
        connector: new BinanceSmartChainInjectedConnector({ debug: true }),
      },
    ],
  },
};

export const MultiwalletProvider: FunctionComponent = ({ children }) => {
  return <RenMultiwalletProvider>{children}</RenMultiwalletProvider>;
};
