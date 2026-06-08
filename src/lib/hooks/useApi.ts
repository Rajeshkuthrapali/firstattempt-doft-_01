import { useState, useCallback, useRef, useEffect } from "react";
import { ApiError } from "../api/client";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * React hook wrapping API calls with loading/error state management.
 *
 * @param apiFn - An API function from the `api` object (e.g. api.get, api.post)
 * @param deps - Dependency array to recreate the execute function
 *
 * @example
 * const { data, loading, error, execute } = useApi(api.get, ["/api/products"]);
 * useEffect(() => { execute(); }, [execute]);
 */
export function useApi<T>(
  apiFn: (...args: any[]) => Promise<{ data: T }>,
  deps: any[] = [],
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFn(...args);
        // Handle both { success: true, data } envelope and direct responses
        const data =
          response && typeof response === "object" && "data" in response
            ? (response as { data: T }).data
            : (response as unknown as T);
        if (mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
        return data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.body?.error ?? err.body?.message ?? `Request failed with status ${err.status}`
            : (err as Error).message ?? "An unexpected error occurred";
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: message });
        }
        return undefined;
      }
    },
    deps,
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
