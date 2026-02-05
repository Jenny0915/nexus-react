import { useEffect, useState } from "react";

export function useApi(requestFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await requestFn();
        if (!alive) return;
        setData(res.data);
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}