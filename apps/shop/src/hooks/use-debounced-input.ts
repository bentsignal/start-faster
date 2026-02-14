import { useEffect, useState } from "react";

export default function useDebouncedInput(options?: {
  time?: number;
  initialValue?: string;
}) {
  const { time = 500, initialValue = "" } = options ?? {};
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, time);
    return () => clearTimeout(timeout);
  }, [value, time]);

  return { value, setValue, debouncedValue };
}
