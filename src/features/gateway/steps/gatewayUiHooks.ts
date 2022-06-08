import { useCallback, useState } from "react";
import { useCurrentChainWallet } from "../../wallet/walletHooks";

export const useGatewayMenuControl = () => {
  const { connected } = useCurrentChainWallet();

  const [menuOpened, setMenuOpened] = useState(false);
  const handleMenuClose = useCallback(() => {
    setMenuOpened(false);
  }, []);
  const handleMenuOpen = useCallback(() => {
    if (connected) {
      setMenuOpened(true);
    }
  }, [connected]);

  return { menuOpened, handleMenuOpen, handleMenuClose };
};
