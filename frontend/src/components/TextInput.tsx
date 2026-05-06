import "./TextInput.css";

interface TextInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}

export function TextInput({
  id,
  placeholder,
  value,
  onChange,
  disabled = false,
  type = "text",
}: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      className="text-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
