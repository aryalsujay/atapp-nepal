/**
 * Tiny debounce hook. Returns a value that lags `value` by `delay` ms.
 *
 *   const [q, setQ] = useState('');
 *   const debouncedQ = useDebounced(q, 150);
 *   // run filter against `debouncedQ`, not `q`
 *
 * 150 ms is the sweet spot for search-as-you-type: fast enough to feel
 * instant on a stop, slow enough to skip work while keys are still
 * coming in.
 */

import { useEffect, useState } from 'react';

export function useDebounced<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
