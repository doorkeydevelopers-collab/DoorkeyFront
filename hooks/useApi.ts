import { useState, useCallback } from 'react';
import { getAxiosInstance } from '@/services/axiosConfig';
import { API_MESSAGES } from '@/constants/messages';

interface UseApiState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiOptions {
  showError?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi() {
  const [state, setState] = useState<UseApiState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const request = useCallback(
    async <T = any,>(
      method: 'get' | 'post' | 'put' | 'delete' | 'patch',
      url: string,
      data?: any,
      options?: UseApiOptions
    ): Promise<T | null> => {
      setState({ isLoading: true, error: null, success: false });

      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance[method]<any, T>(url, data);

        setState({ isLoading: false, error: null, success: true });

        if (options?.onSuccess) {
          options.onSuccess(response);
        }

        return response as T;
      } catch (err: any) {
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          API_MESSAGES.SERVER_ERROR;

        setState({
          isLoading: false,
          error: options?.showError !== false ? errorMessage : null,
          success: false,
        });

        if (options?.onError) {
          options.onError(err);
        }

        console.error('[useApi] Error:', err);
        return null;
      }
    },
    []
  );

  const get = useCallback(
    async <T = any,>(url: string, options?: UseApiOptions): Promise<T | null> => {
      return request<T>('get', url, undefined, options);
    },
    [request]
  );

  const post = useCallback(
    async <T = any,>(url: string, data?: any, options?: UseApiOptions): Promise<T | null> => {
      return request<T>('post', url, data, options);
    },
    [request]
  );

  const put = useCallback(
    async <T = any,>(url: string, data?: any, options?: UseApiOptions): Promise<T | null> => {
      return request<T>('put', url, data, options);
    },
    [request]
  );

  const patch = useCallback(
    async <T = any,>(url: string, data?: any, options?: UseApiOptions): Promise<T | null> => {
      return request<T>('patch', url, data, options);
    },
    [request]
  );

  const remove = useCallback(
    async <T = any,>(url: string, options?: UseApiOptions): Promise<T | null> => {
      return request<T>('delete', url, undefined, options);
    },
    [request]
  );

  const resetState = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    request,
    get,
    post,
    put,
    patch,
    delete: remove,
    resetState,
  };
}
