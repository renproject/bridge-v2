import {
  AbstractEthereumConnector,
  SaneProvider,
  AbstractEthereumConnectorOptions,
} from "@renproject/multiwallet-abstract-ethereum-connector";
import { ConnectorInterface } from "@renproject/multiwallet-base-connector";
import { SyncOrPromise } from "@renproject/interfaces";

export interface CoinbaseConnectorOptions
  extends AbstractEthereumConnectorOptions {
  debug: boolean;
}

// No good typings for injected providers exist.
export type InjectedProvider = SaneProvider & {
  isCoinbaseWallet?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: (request: { method: string }) => Promise<any>;
  enable: () => Promise<void>;
  on: (
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => SyncOrPromise<void>
  ) => void;
};

const isResults = <T>(x: { results: T } | T): x is { results: T } =>
  (x as { results: T }).results !== undefined;

const resultOrRaw = <T>(x: { results: T } | T) => {
  if (isResults(x)) {
    return x.results;
  }
  return x;
};

export class CoinbaseInjectedConnector extends AbstractEthereumConnector<InjectedProvider> {
  supportsTestnet = true;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: CoinbaseConnectorOptions) {
    super(options);
  }
  handleUpdate = () => {
    this.getStatus()
      .then((...args) => {
        this.emitter.emitUpdate(...args);
      })
      .catch(async (...args) => this.deactivate(...args));
  };

  activate: ConnectorInterface<any, any>["activate"] = async () => {
    // Await in case a child class's getProvider is asynchronous.
    const provider = await (
      this as AbstractEthereumConnector<InjectedProvider>
    ).getProvider();

    if (!provider) {
      throw Error("Missing Provider");
    }

    // clear all previous listeners
    await this.cleanup();

    let account;
    try {
      account = resultOrRaw(
        await provider.request({ method: "eth_requestAccounts" })
      )[0];
    } catch (error: any) {
      if (error.code === 4001) {
        this.emitter.emitError(new Error("User rejected request"));
      }
      console.error(error);
    }

    // if unsuccessful, try enable
    if (!account) {
      account = resultOrRaw((await provider.enable()) as any)[0];
    }
    provider.on("close", this.deactivate);
    provider.on("networkChanged", this.handleUpdate);
    provider.on("accountsChanged", this.handleUpdate);
    provider.on("chainChanged", this.handleUpdate);
    return this.getStatus();
  };

  getProvider = () => {
    const ethereum = (window as any).ethereum;
    if (ethereum.providers) {
      for (const provider of ethereum.providers) {
        if (provider.isCoinbaseWallet) {
          return provider as InjectedProvider;
        }
      }
      return undefined as unknown as InjectedProvider;
    }
    if (!ethereum.isCoinbaseWallet) {
      return undefined as unknown as InjectedProvider;
    }
    return ethereum as InjectedProvider;
  };

  cleanup = async () => {
    // Await in case a child class's getProvider is asynchronous.
    const provider = await (
      this as AbstractEthereumConnector<InjectedProvider>
    ).getProvider();
    if (provider.removeListener) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      provider.removeListener("close", this.deactivate);
      provider.removeListener("networkChanged", this.handleUpdate);
      provider.removeListener("accountsChanged", this.handleUpdate);
      provider.removeListener("chainChanged", this.handleUpdate);
    }
  };

  deactivate = async (reason?: string) => {
    await this.cleanup();
    this.emitter.emitDeactivate(reason);
  };
}
