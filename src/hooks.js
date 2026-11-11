import { useCallback, useState } from "react";

// useState that is mirrored to localStorage (per-device preferences only).
export function usePersistentState(key, initial, normalize = (v) => v) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return normalize({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    return initial;
  });

  const update = useCallback(
    (patch) => {
      setValue((prev) => {
        const next = normalize({ ...prev, ...patch });
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key, normalize]
  );

  return [value, update];
}
