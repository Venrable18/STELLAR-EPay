import { useState } from "react";
import { TextInput } from "../components/TextInput";
import { TextArea } from "../components/TextArea";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Message } from "../components/Message";
import "./DepositPage.css";

export function DepositPage() {
  const [amount, setAmount] = useState("");
  const [recipientPubKey, setRecipientPubKey] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [depositResult, setDepositResult] = useState<{
    leafIndex: string;
    newRoot: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    if (!recipientPubKey.trim()) {
      setMessage({
        type: "error",
        text: "Please enter recipient privacy public key",
      });
      return;
    }

    // Simulate deposit
    setIsLoading(true);
    setTimeout(() => {
      setMessage({
        type: "success",
        text: `Deposit of ${amount} initiated successfully!`,
      });
      setDepositResult({
        leafIndex: "42",
        newRoot: "0x" + "a".repeat(64),
      });
      setIsLoading(false);
    }, 800);
  };

  const handleClear = () => {
    setAmount("");
    setRecipientPubKey("");
    setMessage(null);
    setDepositResult(null);
  };

  return (
    <div className="deposit-page">
      <div className="page-header">
        <h2>Deposit</h2>
        <p>Add funds to the private pool</p>
      </div>

      <div className="deposit-container">
        <Card className="deposit-form-card">
          <h3>Deposit Form</h3>

          {message && (
            <Message type={message.type} text={message.text} onClose={() => setMessage(null)} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <TextInput
                id="amount"
                placeholder="Enter amount to deposit"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
              <small>In smallest units of the token</small>
            </div>

            <div className="form-group">
              <label htmlFor="recipient-key">Recipient Privacy Public Key</label>
              <TextArea
                id="recipient-key"
                placeholder="Paste recipient's privacy public key (hex)"
                value={recipientPubKey}
                onChange={(e) => setRecipientPubKey(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
              <small>This is different from their Stellar address</small>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? "Depositing..." : "Deposit"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {depositResult && (
          <Card className="deposit-result-card">
            <h3>Deposit Result</h3>
            <div className="result-item">
              <label>Leaf Index</label>
              <code>{depositResult.leafIndex}</code>
            </div>
            <div className="result-item">
              <label>New Root</label>
              <code className="long-hash">{depositResult.newRoot}</code>
            </div>
          </Card>
        )}

        <Card className="pool-info-card">
          <h3>Pool Information</h3>
          <div className="info-item">
            <label>Current Pool Balance</label>
            <p className="balance">250,000.00 USDC</p>
          </div>
          <div className="info-item">
            <label>Total Deposits (v1)</label>
            <p className="stat">5 deposits</p>
          </div>
          <div className="info-item">
            <label>Next Leaf Index</label>
            <p className="stat">42</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
