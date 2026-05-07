import { useState } from "react";
import { TextInput } from "../components/TextInput";
import { TextArea } from "../components/TextArea";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Message } from "../components/Message";
import "./TransferPage.css";

interface Note {
  id: string;
  commitment: string;
  amount: string;
  status: "available" | "spent";
}

export function TransferPage() {
  const [selectedNote, setSelectedNote] = useState("");
  const [recipientPubKey, setRecipientPubKey] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [transferResult, setTransferResult] = useState<{
    proofValid: boolean;
    outputCommitment: string;
    newRoot: string;
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
      setMessage({ type: "error", text: "Please select a note to transfer" });
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

    if (!recipientPubKey.trim()) {
      setMessage({
        type: "error",
        text: "Please enter recipient privacy public key",
      });
      return;
    }

    // Simulate transfer
    setIsLoading(true);
    setTimeout(() => {
      setMessage({
        type: "success",
        text: `Transfer of ${amount} initiated successfully!`,
      });
      setTransferResult({
        proofValid: true,
        outputCommitment: "0x" + "d".repeat(64),
        newRoot: "0x" + "e".repeat(64),
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    setSelectedNote("");
    setRecipientPubKey("");
    setAmount("");
    setMessage(null);
    setTransferResult(null);
  };

  return (
    <div className="transfer-page">
      <div className="page-header">
        <h2>Private Transfer</h2>
        <p>Send funds privately within the pool</p>
      </div>

      <div className="transfer-container">
        <Card className="transfer-form-card">
          <h3>Transfer Form</h3>

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
              <small>Select an available note to transfer from</small>
            </div>

            {selectedNoteData && (
              <div className="form-group">
                <label>Selected Note Details</label>
                <div className="note-details">
                  <div className="detail-row">
                    <span>Amount:</span>
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
              <label htmlFor="transfer-amount">Transfer Amount</label>
              <TextInput
                id="transfer-amount"
                placeholder="Enter amount to transfer"
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
                {isLoading ? "Transferring..." : "Transfer"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {transferResult && (
          <Card className="transfer-result-card">
            <h3>Transfer Result</h3>
            <div className="result-item">
              <label>Proof Valid</label>
              <div className={`badge badge-${transferResult.proofValid ? "success" : "error"}`}>
                {transferResult.proofValid ? "Valid" : "Invalid"}
              </div>
            </div>
            <div className="result-item">
              <label>Output Commitment</label>
              <code className="long-hash">{transferResult.outputCommitment}</code>
            </div>
            <div className="result-item">
              <label>New Root</label>
              <code className="long-hash">{transferResult.newRoot}</code>
            </div>
          </Card>
        )}

        <Card className="available-notes-card">
          <h3>Available Notes ({availableNotes.length})</h3>
          <div className="notes-list">
            {availableNotes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <span className="note-id">{note.id}</span>
                  <span className={`badge badge-${note.status}`}>
                    {note.status}
                  </span>
                </div>
                <div className="note-info">
                  <span className="note-amount">{note.amount} units</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
