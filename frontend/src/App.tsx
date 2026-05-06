import { useState } from "react";
import { DepositPage } from "./pages/DepositPage";
import { TransferPage } from "./pages/TransferPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { NotesPage } from "./pages/NotesPage";
import { Navigation } from "./components/Navigation";
import "./App.css";

type PageType = "deposit" | "transfer" | "withdraw" | "notes";

export function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("deposit");

  const renderPage = () => {
    switch (currentPage) {
      case "deposit":
        return <DepositPage />;
      case "transfer":
        return <TransferPage />;
      case "withdraw":
        return <WithdrawPage />;
      case "notes":
        return <NotesPage />;
      default:
        return <DepositPage />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Stellar-EncryptedPay</h1>
        <p className="subtitle">Privacy-preserving payments on Stellar</p>
      </header>

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="app-main">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Stellar-EncryptedPay. Built with Soroban & Circom.</p>
      </footer>
    </div>
  );
}
