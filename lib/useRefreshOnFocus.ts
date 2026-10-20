import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export function useRefreshOnFocus(refresh: () => Promise<unknown>) {
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
}
