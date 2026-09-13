import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export async function startDirectConversation(otherUserId: string) {
  const { data, error } = await supabase.rpc('start_direct_conversation', {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string, before?: string) {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (before) query = query.lt('created_at', before);
  const { data, error } = await query;
  if (error) throw error;
  return data.toReversed();
}

export async function sendMessage(input: {
  body: string;
  clientId: string;
  conversationId: string;
  senderId: string;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      body: input.body.trim(),
      client_id: input.clientId,
      conversation_id: input.conversationId,
      sender_id: input.senderId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markConversationRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
  if (error) throw error;
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Tables<'messages'>) => void,
) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: RealtimePostgresInsertPayload<Tables<'messages'>>) => onMessage(payload.new),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
