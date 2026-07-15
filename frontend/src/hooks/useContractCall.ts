import { useState, useCallback } from 'react';

interface UseContractCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseContractCallReturn {
  execute: (...args: any[]) => Promise<any>;
  loading: boolean;
  error: Error | null;
  data: any;
  reset: () => void;
}

export function useContractCall(
  contractMethod: (...args: any[]) => Promise<any>,
  options?: UseContractCallOptions
): UseContractCallReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);

        const result = await contractMethod(...args);
        setData(result);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (options?.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [contractMethod, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}

export default useContractCall;
