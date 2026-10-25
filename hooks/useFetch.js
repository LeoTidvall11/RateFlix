import { useEffect, useState } from 'react';

export function useFetch(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetcher();
        if (!cancelled) setData(data);
      } catch (error) {
        if (!cancelled) setError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    let cancelled = false;
    load();
    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  return { data, loading, error, reload };
}
