import Typography from "@material-ui/core/Typography";
import { RenNetwork } from "@renproject/interfaces";
import { BinanceSmartChainInjectedConnector } from "@renproject/multiwallet-binancesmartchain-injected-connector";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { MultiwalletProvider as RenMultiwalletProvider } from "@renproject/multiwallet-ui";
import React, { FunctionComponent } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../components/buttons/Buttons";
import { PaperContent } from "../../components/layout/Paper";
import { SpacedPaperContent } from "../../features/transactions/components/TransactionsHelpers";
import { RenChain } from "../../utils/assetConfigs";

const networkMapping: Record<number, RenNetwork> = {
  1: RenNetwork.Mainnet,
  4: RenNetwork.TestnetVDot3,
  42: RenNetwork.Testnet,
};

export const ethNetworkToRenNetwork = (id: string | number): RenNetwork => {
  const index = Number(id);
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
      // FIXME: this will load Metamask if BSC Wallet is not installed
      // is this behavior what we want?
      {
        name: "BinanceSmartWallet",
        logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
        connector: new BinanceSmartChainInjectedConnector({ debug: true }),
      },
      // TODO: move this config into its own connector?
      {
        name: "Metamask",
        logo: "https://avatars2.githubusercontent.com/u/45615063?s=60&v=4",
        info: ({ acknowledge, onClose }: any) => (
          <>
            <SpacedPaperContent topPadding>
              <Typography variant="h5" align="center" gutterBottom>
                Please ensure that you have added the BSC network to Metamask as
                explained{" "}
                <a href="https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain">
                  here
                </a>
              </Typography>
            </SpacedPaperContent>
            <PaperContent>
              <ActionButtonWrapper>
                <ActionButton onClick={acknowledge}>Ok</ActionButton>
                <ActionButton onClick={onClose}>Cancel</ActionButton>
              </ActionButtonWrapper>
            </PaperContent>
          </>
        ),
        connector: (() => {
          const connector = new BinanceSmartChainInjectedConnector({
            debug: true,
          });
          connector.getProvider = () => (window as any).ethereum;
          return connector;
        })(),
      },
    ],
  },
};

export const MultiwalletProvider: FunctionComponent = ({ children }) => {
  return <RenMultiwalletProvider>{children}</RenMultiwalletProvider>;
};
