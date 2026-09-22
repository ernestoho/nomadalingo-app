import type { Session, User } from '@biltme/backend';
import { useQueryClient } from '@tanstack/react-query';
import type { AppStateStatus } from 'react-native';
import { AppState, Platform } from 'react-native';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { bilt } from '@/lib/backend';

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);
  const transitionId = useRef(0);

  const applySession = useCallback(
    async (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;

      if (currentUserId.current !== nextUserId) {
        const activeTransition = ++transitionId.current;
        setIsLoading(true);
        setSession(null);
        await queryClient.cancelQueries();
        queryClient.clear();
        if (transitionId.current !== activeTransition) return;
      }

      currentUserId.current = nextUserId;
      setSession(nextSession);
      setIsLoading(false);
    },
    [queryClient],
  );

  useEffect(() => {
    let isMounted = true;
    let receivedAuthEvent = false;

    const { data } = bilt.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      receivedAuthEvent = true;
      void applySession(nextSession);
    });

    void bilt.auth.getSession().then(({ data: sessionData, error }) => {
      if (!isMounted || receivedAuthEvent) return;
      if (error) console.warn('Unable to restore the signed-in session.');
      void applySession(sessionData.session);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;

    const updateRefreshState = (state: AppStateStatus) => {
      if (state === 'active') void bilt.auth.startAutoRefresh();
      else void bilt.auth.stopAutoRefresh();
    };

    updateRefreshState(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateRefreshState);
    return () => {
      subscription.remove();
      void bilt.auth.stopAutoRefresh();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isLoading, session, user: session?.user ?? null }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
