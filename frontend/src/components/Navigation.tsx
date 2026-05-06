import "./Navigation.css";

type PageType = "deposit" | "transfer" | "withdraw" | "notes";

interface NavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const pages: { id: PageType; label: string }[] = [
    { id: "deposit", label: "Deposit" },
    { id: "transfer", label: "Transfer" },
    { id: "withdraw", label: "Withdraw" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`nav-tab ${currentPage === page.id ? "active" : ""}`}
            onClick={() => onPageChange(page.id)}
          >
            {page.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
