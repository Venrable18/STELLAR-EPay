import { useState } from "react";
import { TextInput } from "../components/TextInput";
import { TextArea } from "../components/TextArea";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Message } from "../components/Message";
import "./WithdrawPage.css";

interface Note {
  id: string;
  commitment: string;
  amount: string;
  status: "available" | "spent";
}

export function WithdrawPage() {
  const [selectedNote, setSelectedNote] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [withdrawResult, setWithdrawResult] = useState<{
    proofValid: boolean;
    txHash: string;
    amountReleased: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock available notes
  const availableNotes: Note[] = [
    {
      id: "note-001",
      commitment: "0x" + "a".repeat(64),
      amount: "100",
      status: "available",
    },
    {
      id: "note-002",
      commitment: "0x" + "b".repeat(64),
      amount: "250",
      status: "available",
    },
    {
      id: "note-003",
      commitment: "0x" + "c".repeat(64),
      amount: "50",
      status: "available",
    },
  ];

  const selectedNoteData = availableNotes.find((n) => n.id === selectedNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedNote) {
      setMessage({ type: "error", text: "Please select a note to withdraw" });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    if (selectedNoteData && parseFloat(amount) > parseFloat(selectedNoteData.amount)) {
      setMessage({ type: "error", text: "Amount exceeds note value" });
      return;
    }

    if (!recipientAddress.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a Stellar account address",
      });
      return;
    }

    if (!recipientAddress.startsWith("G")) {
      setMessage({
        type: "error",
        text: "Invalid Stellar address (must start with G)",
      });
      return;
    }

    // Simulate withdrawal
    setIsLoading(true);
    setTimeout(() => {
      setMessage({
        type: "success",
        text: `Withdrawal of ${amount} completed successfully!`,
      });
      setWithdrawResult({
        proofValid: true,
        txHash: "0x" + "f".repeat(64),
        amountReleased: amount,
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    setSelectedNote("");
    setRecipientAddress("");
    setAmount("");
    setMessage(null);
    setWithdrawResult(null);
  };

  return (
    <div className="withdraw-page">
      <div className="page-header">
        <h2>Withdraw</h2>
        <p>Withdraw funds back to your public account</p>
      </div>

      <div className="withdraw-container">
        <Card className="withdraw-form-card">
          <h3>Withdrawal Form</h3>

          {message && (
            <Message type={message.type} text={message.text} onClose={() => setMessage(null)} />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="note-select">Select Note</label>
              <select
                id="note-select"
                className="select-input"
                value={selectedNote}
                onChange={(e) => setSelectedNote(e.target.value)}
                disabled={isLoading}
              >
                <option value="">-- Choose a note --</option>
                {availableNotes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.id} - {note.amount} units ({note.status})
                  </option>
                ))}
              </select>
              <small>Select an available note to withdraw from</small>
            </div>

            {selectedNoteData && (
              <div className="form-group">
                <label>Selected Note Details</label>
                <div className="note-details">
                  <div className="detail-row">
                    <span>Available Amount:</span>
                    <strong>{selectedNoteData.amount} units</strong>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className={`badge badge-${selectedNoteData.status}`}>
                      {selectedNoteData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="withdraw-amount">Withdrawal Amount</label>
              <TextInput
                id="withdraw-amount"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
              <small>
                {selectedNoteData
                  ? `Maximum: ${selectedNoteData.amount} units`
                  : "Select a note first"}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="recipient-address">Recipient Stellar Address</label>
              <TextArea
                id="recipient-address"
                placeholder="Paste recipient Stellar address (starts with G...)"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
              <small>The public Stellar account that will receive the funds</small>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? "Withdrawing..." : "Withdraw"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {withdrawResult && (
          <Card className="withdraw-result-card">
            <h3>Withdrawal Confirmed</h3>
            <div className="result-item">
              <label>Proof Valid</label>
              <div className={`badge badge-${withdrawResult.proofValid ? "success" : "error"}`}>
                {withdrawResult.proofValid ? "Valid" : "Invalid"}
              </div>
            </div>
            <div className="result-item">
              <label>Amount Released</label>
              <p className="amount-released">{withdrawResult.amountReleased} units</p>
            </div>
            <div className="result-item">
              <label>Transaction Hash</label>
              <code className="long-hash">{withdrawResult.txHash}</code>
            </div>
          </Card>
        )}

        <Card className="pool-status-card">
          <h3>Pool Status</h3>
          <div className="status-item">
            <label>Current Pool Balance</label>
            <p className="balance">250,000.00 USDC</p>
          </div>
          <div className="status-item">
            <label>Total Withdrawals (v1)</label>
            <p className="stat">3 withdrawals</p>
          </div>
          <div className="status-item">
            <label>Available Notes</label>
            <p className="stat">{availableNotes.filter((n) => n.status === "available").length} notes</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
