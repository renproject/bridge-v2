import { ethers } from "ethers";
import { env } from "../../constants/environmentVariables";
import { useEffect, useState } from "react";

export function useENS(address: string | null | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    async function resolveENS() {
      const provider = new ethers.providers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${env.INFURA_ID}`
      );

      if (address && ethers.utils.isAddress(address)) {
        const ensName = await provider.lookupAddress(address);
        if (ensName) setEnsName(ensName);
      }
    }
    resolveENS().catch((error) => {
      console.error(error);
    });
  }, [address]);

  return { ensName };
}
