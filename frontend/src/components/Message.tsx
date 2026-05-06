import "./Message.css";

interface MessageProps {
  type: "success" | "error" | "info";
  text: string;
  onClose?: () => void;
}

export function Message({ type, text, onClose }: MessageProps) {
  return (
    <div className={`message message-${type}`}>
      <span className="message-icon">
        {type === "success" && "✓"}
        {type === "error" && "✕"}
        {type === "info" && "ℹ"}
      </span>
      <span className="message-text">{text}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}
