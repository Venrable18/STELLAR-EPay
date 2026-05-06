import { Card } from "../components/Card";

export function NotesPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2>Notes</h2>
        <p>View and manage your private notes</p>
      </div>

      <Card>
        <h3>Notes Inspector</h3>
        <p style={{ color: "#999", marginBottom: "20px" }}>
          Coming soon - Static table layout
        </p>
        <div style={{ padding: "40px", textAlign: "center", background: "#f5f5f5", borderRadius: "4px" }}>
          <p>Notes page stub - to be implemented</p>
        </div>
      </Card>
    </div>
  );
}
