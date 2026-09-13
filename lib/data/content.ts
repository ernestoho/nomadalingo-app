import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';

export const contentKeys = {
  all: ['content'] as const,
  venues: ['content', 'venues'] as const,
  meetups: ['content', 'meetups'] as const,
  officialEvent: ['content', 'official-event'] as const,
  membershipPlans: ['content', 'membership-plans'] as const,
};

export async function getVenues() {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('published', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function getUpcomingMeetups() {
  const { data, error } = await supabase
    .from('meetups')
    .select('*')
    .eq('published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');
  if (error) throw error;
  return data;
}

export async function getCurrentOfficialEvent() {
  const { data, error } = await supabase
    .from('official_events')
    .select('*')
    .eq('published', true)
    .eq('is_current', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMembershipPlans() {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

async function getContentVersion() {
  const { data, error } = await supabase
    .from('content_version')
    .select('version')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data.version;
}

export function useContentSync() {
  const queryClient = useQueryClient();
  const lastVersion = useRef<number | null>(null);
  const query = useQuery({
    queryKey: ['content-version'],
    queryFn: getContentVersion,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data === undefined) return;
    if (lastVersion.current !== null && lastVersion.current !== query.data) {
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    }
    lastVersion.current = query.data;
  }, [query.data, queryClient]);
}
