import { useState } from "react";
import { useWallet } from "../hooks";
import "./WalletHeader.css";

export function WalletHeader() {
  const { wallet, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const truncateAddress = (addr: string, length = 8) => {
    return addr.slice(0, length) + "..." + addr.slice(-6);
  };

  return (
    <div className="wallet-header">
      {wallet.isConnected ? (
        <div className="wallet-connected">
          <div className="wallet-info">
            <span className="network-badge">{wallet.network}</span>
            <div className="address-display">
              <small>Connected Account</small>
              <code>{truncateAddress(wallet.address || "")}</code>
            </div>
            <div className="balance-display">
              <small>Balance</small>
              <p>{wallet.balance} XLM</p>
            </div>
          </div>
          <button className="disconnect-btn" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
