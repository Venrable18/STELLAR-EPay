import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import "./NotesPage.css";

interface Note {
  index: number;
  commitment: string;
  amount: string;
  status: "spent" | "unspent";
  createdAt: string;
}

export function NotesPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([
    {
      index: 0,
      commitment: "0x" + "a".repeat(64),
      amount: "100.00",
      status: "unspent",
      createdAt: "2026-05-01 14:32:00",
    },
    {
      index: 1,
      commitment: "0x" + "b".repeat(64),
      amount: "250.50",
      status: "spent",
      createdAt: "2026-05-02 09:15:00",
    },
    {
      index: 2,
      commitment: "0x" + "c".repeat(64),
      amount: "50.25",
      status: "unspent",
      createdAt: "2026-05-03 16:45:00",
    },
    {
      index: 3,
      commitment: "0x" + "d".repeat(64),
      amount: "500.00",
      status: "unspent",
      createdAt: "2026-05-04 11:20:00",
    },
    {
      index: 4,
      commitment: "0x" + "e".repeat(64),
      amount: "175.75",
      status: "spent",
      createdAt: "2026-05-05 13:05:00",
    },
  ]);

  const selectedNote = notes.find((n) => n.index === selectedIndex);
  const unspentNotes = notes.filter((n) => n.status === "unspent");
  const spentNotes = notes.filter((n) => n.status === "spent");

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((n) => n.index !== index));
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  };

  const handleCopyCommitment = (commitment: string) => {
    navigator.clipboard.writeText(commitment);
  };

  return (
    <div className="notes-page">
      <div className="page-header">
        <h2>Private Notes</h2>
        <p>View and manage your private payment notes</p>
      </div>

      <div className="notes-container">
        <Card className="notes-table-card">
          <h3>All Notes ({notes.length})</h3>

          <div className="notes-stats">
            <div className="stat-badge">
              <span className="stat-label">Unspent:</span>
              <span className="stat-value">{unspentNotes.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Spent:</span>
              <span className="stat-value">{spentNotes.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">
                {notes.reduce((sum, n) => sum + parseFloat(n.amount), 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr
                    key={note.index}
                    className={`note-row ${selectedIndex === note.index ? "selected" : ""}`}
                    onClick={() => setSelectedIndex(note.index)}
                  >
                    <td className="index-cell">{note.index}</td>
                    <td className="amount-cell">{note.amount}</td>
                    <td className="status-cell">
                      <span className={`status-badge status-${note.status}`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="date-cell">{note.createdAt}</td>
                    <td className="action-cell">
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.index);
                        }}
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notes.length === 0 && (
            <div className="empty-state">
              <p>No notes found. Start by making a deposit.</p>
            </div>
          )}
        </Card>

        {selectedNote && (
          <Card className="note-details-card">
            <h3>Note Details</h3>

            <div className="detail-section">
              <label>Index</label>
              <div className="detail-value">{selectedNote.index}</div>
            </div>

            <div className="detail-section">
              <label>Commitment</label>
              <div className="commitment-display">
                <code>{selectedNote.commitment}</code>
                <button
                  className="copy-btn"
                  onClick={() => handleCopyCommitment(selectedNote.commitment)}
                  title="Copy commitment"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="detail-section">
              <label>Amount</label>
              <div className="amount-display">{selectedNote.amount}</div>
            </div>

            <div className="detail-section">
              <label>Status</label>
              <div>
                <span className={`status-badge status-${selectedNote.status} large`}>
                  {selectedNote.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <label>Created At</label>
              <div className="detail-value">{selectedNote.createdAt}</div>
            </div>

            <div className="detail-actions">
              <Button
                variant="danger"
                onClick={() => handleDeleteNote(selectedNote.index)}
              >
                Delete Note
              </Button>
              <Button variant="secondary" onClick={() => setSelectedIndex(null)}>
                Close
              </Button>
            </div>
          </Card>
        )}

        {!selectedNote && notes.length > 0 && (
          <Card className="note-help-card">
            <h3>Info</h3>
            <p>Click on a note in the table to view its details.</p>
            <div className="info-list">
              <div className="info-item">
                <strong>Unspent Notes:</strong> Available for transfer or withdrawal
              </div>
              <div className="info-item">
                <strong>Spent Notes:</strong> Already used in a transaction (for reference)
              </div>
              <div className="info-item">
                <strong>Commitment:</strong> Hash of note secret (public identifier)
              </div>
              <div className="info-item">
                <strong>Amount:</strong> Value in the note (in pool's token unit)
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
