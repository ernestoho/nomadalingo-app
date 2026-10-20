import type { Enums, Tables } from '@biltme/backend';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bilt } from '@/lib/backend';

export type Profile = Tables<'profiles'>;
export type Event = Tables<'events'>;
export type ChatRequest = Tables<'chat_requests'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await bilt
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      throwIfError(error);
      return data;
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await bilt
        .from('events')
        .select('*')
        .eq('published', true)
        .order('starts_at');
      throwIfError(error);
      return data ?? [];
    },
  });
}

export function useMyRsvps(userId?: string) {
  return useQuery({
    queryKey: ['rsvps', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await bilt.from('event_rsvps').select('*').eq('user_id', userId!);
      throwIfError(error);
      return data ?? [];
    },
  });
}

export function usePeople(userId?: string) {
  return useQuery({
    queryKey: ['people', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await bilt
        .from('profiles')
        .select('*')
        .neq('id', userId!)
        .not('onboarding_completed_at', 'is', null)
        .order('display_name');
      throwIfError(error);
      return data ?? [];
    },
  });
}

export function useChatRequests(userId?: string) {
  return useQuery({
    queryKey: ['chat-requests', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await bilt
        .from('chat_requests')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      throwIfError(error);
      return data ?? [];
    },
  });
}

export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ['conversations', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await bilt
        .from('conversations')
        .select('*')
        .or(`participant_low_id.eq.${userId},participant_high_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      throwIfError(error);
      return data ?? [];
    },
  });
}

export function useMessages(userId?: string, conversationId?: string) {
  return useQuery({
    queryKey: ['messages', userId, conversationId],
    enabled: Boolean(userId && conversationId),
    refetchInterval: 4_000,
    queryFn: async () => {
      const messages: Message[] = [];
      const pageSize = 1000;
      let offset = 0;
      while (true) {
        const { data, error } = await bilt
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId!)
          .order('created_at')
          .order('id')
          .range(offset, offset + pageSize - 1);
        throwIfError(error);
        const page = data ?? [];
        messages.push(...page);
        if (page.length < pageSize) return messages;
        offset += pageSize;
      }
    },
  });
}

export function useMvpActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries();

  return {
    saveProfile: useMutation({
      mutationFn: async (profile: {
        id: string;
        display_name: string;
        spoken_languages: string[];
        learning_languages: string[];
        learning_level: Enums<'language_level'>;
        bio: string;
        adult_confirmed_at: string | null;
        onboarding_completed_at: string | null;
      }) => {
        const { error } = await bilt.from('profiles').upsert(profile);
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    joinEvent: useMutation({
      mutationFn: async (eventId: string) => {
        const { error } = await bilt.rpc('join_event', { target_event_id: eventId });
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    cancelRsvp: useMutation({
      mutationFn: async (eventId: string) => {
        const { error } = await bilt.rpc('cancel_event_rsvp', { target_event_id: eventId });
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    requestChat: useMutation({
      mutationFn: async (recipientId: string) => {
        const { data, error } = await bilt.rpc('create_chat_request', {
          target_recipient_id: recipientId,
        });
        throwIfError(error);
        if (!data) throw new Error('No se pudo enviar la solicitud.');
      },
      onSuccess: refresh,
    }),
    acceptRequest: useMutation({
      mutationFn: async (requestId: string) => {
        const { data, error } = await bilt.rpc('accept_chat_request', {
          target_request_id: requestId,
        });
        throwIfError(error);
        return data;
      },
      onSuccess: refresh,
    }),
    declineRequest: useMutation({
      mutationFn: async (requestId: string) => {
        const { error } = await bilt.rpc('decline_chat_request', {
          target_request_id: requestId,
        });
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    sendMessage: useMutation({
      mutationFn: async (input: {
        conversation_id: string;
        sender_id: string;
        client_id: string;
        body: string;
      }) => {
        const { error } = await bilt.from('messages').insert(input);
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    blockUser: useMutation({
      mutationFn: async (userId: string) => {
        const { error } = await bilt.rpc('block_user', { target_user_id: userId });
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
    reportUser: useMutation({
      mutationFn: async (input: {
        reporter_id: string;
        reported_user_id: string;
        reason: Enums<'report_reason'>;
        details?: string;
        message_id?: string;
      }) => {
        const { error } = await bilt.from('reports').insert(input);
        throwIfError(error);
      },
      onSuccess: refresh,
    }),
  };
}
