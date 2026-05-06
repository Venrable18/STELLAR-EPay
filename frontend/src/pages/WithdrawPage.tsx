import { Card } from "../components/Card";

export function WithdrawPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2>Withdraw</h2>
        <p>Withdraw funds back to public account</p>
      </div>

      <Card>
        <h3>Withdraw Form</h3>
        <p style={{ color: "#999", marginBottom: "20px" }}>
          Coming soon - Static form layout
        </p>
        <div style={{ padding: "40px", textAlign: "center", background: "#f5f5f5", borderRadius: "4px" }}>
          <p>Withdraw page stub - to be implemented</p>
        </div>
      </Card>
    </div>
  );
}
