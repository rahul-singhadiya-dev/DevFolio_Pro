// src/hooks/useFetch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to avoid re-triggering effect if options change reference
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async (abortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get(url, {
        signal: abortSignal,
        ...optionsRef.current,
      });
      // Extract data from standard envelop: { success: true, data: [...] }
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        setData(response.data);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || axiosIsCancel(err)) {
        // Ignored, request was aborted
        return;
      }
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
  }, [fetchData]);

  return { data, loading, error, refetch, setData };
};

// Helper for checking aborted requests
function axiosIsCancel(value) {
  return !!(value && value.__CANCEL__);
}
