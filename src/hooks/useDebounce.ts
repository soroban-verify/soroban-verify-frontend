import { useEffect, useState } from 'react'

/**
 * Returns a value that only updates after `delay` ms of inactivity.
 *
 * Used by the Explorer page to debounce its search input (issue #2). The
 * component binds its input to the undebounced value (so typing stays
 * responsive) and runs the API call against the debounced value (so we
 * don't fire one request per keystroke).
 *
 * Implemented inline to avoid pulling in a utility dependency for a
 * ~10-line hook.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
