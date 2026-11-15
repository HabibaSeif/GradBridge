import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async function and tracks { data, loading, error }.
 * `reload` lets a page offer a "Try again" button after an error.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    run()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [run, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);

  return { ...state, reload, setData };
}
