import { useState } from "react";

export interface FormMessage {
  type: "success" | "error" | "info";
  text: string;
}

interface UseFormStateOptions {
  onSubmit: () => Promise<void> | void;
  onSuccess?: () => void;
}

export function useFormState(options: UseFormStateOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await options.onSubmit();
      options.onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const setSuccess = (text: string) => {
    setMessage({ type: "success", text });
  };

  const setError = (text: string) => {
    setMessage({ type: "error", text });
  };

  const setInfo = (text: string) => {
    setMessage({ type: "info", text });
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return {
    isLoading,
    message,
    handleSubmit,
    setSuccess,
    setError,
    setInfo,
    clearMessage,
  };
}
