import { useEffect } from 'react';

import { useSessionStore } from '../store/useSessionStore.js';

export function AuthProvider({ children }) {
  const initialise = useSessionStore((state) => state.initialise);

  useEffect(() => {
    initialise();
  }, [initialise]);

  return children;
}
