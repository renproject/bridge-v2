const connectBinanceChain = () => {
  if (getBinanceChain() !== "undefined") {
    getBinanceChain().enable().catch(console.error);
  }
};

const getBinanceChain = () => {
  return (window as any).BinanceChain;
};

export const signWithBinanceChain: (msg: string) => Promise<string> = (
  msg: string
) =>
  new Promise((resolve, reject) => {
    if (!getBinanceChain()) {
      reject("no binance chain");
    }
    getBinanceChain()
      .request({ method: "eth_requestAccounts" })
      .then((addresses: Array<string>) => {
        const from = addresses[0];
        if (!from) return connectBinanceChain();
        getBinanceChain()
          .request({
            method: "eth_sign",
            params: [from, msg],
          })
          .then(resolve)
          .catch(reject);
      });
  });
