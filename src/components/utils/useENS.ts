import { ethers } from "ethers";
import { env } from "../../constants/environmentVariables";
import { useEffect, useState } from "react";

export function useENS(address: string | null | undefined) {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${env.INFURA_ID}`
  );
  const [ensName, setENSName] = useState<string | null>(null);

  useEffect(() => {
    async function resolveENS() {
      if (address && ethers.utils.isAddress(address)) {
        const ensName = await provider.lookupAddress(address);
        if (ensName) setENSName(ensName);
      }
    }
    resolveENS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return { ensName };
}
