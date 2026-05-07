import { useState } from "react";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  network: "public" | "testnet";
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: "testnet",
  });

  const connect = async () => {
    try {
      // Mock wallet connection
      // In production, this would connect to Stellar wallet
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setWallet({
        isConnected: true,
        address: "GCMTWCX6RHFLB25QGMHB43NVCVLZLSDBVBG7GVIXQCKWLG3PVU4HC6E",
        balance: "1000.00",
        network: "testnet",
      });
    } catch (error) {
      console.error("Failed to connect wallet", error);
      throw error;
    }
  };

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      network: "testnet",
    });
  };

  return { wallet, connect, disconnect };
}
