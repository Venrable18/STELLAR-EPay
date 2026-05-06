import "./TextArea.css";

interface TextAreaProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
}

export function TextArea({
  id,
  placeholder,
  value,
  onChange,
  disabled = false,
  rows = 3,
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      className="text-area"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
    />
  );
}
