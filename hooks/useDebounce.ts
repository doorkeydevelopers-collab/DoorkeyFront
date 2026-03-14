import { useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const debouncedValueRef = useRef<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedValueRef.current = value;
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValueRef.current;
}
