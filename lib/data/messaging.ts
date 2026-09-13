import type { Tables } from '@biltme/backend';

import { bilt } from '@/lib/backend';

type MessageInsertPayload = {
  new: Tables<'messages'>;
};

export async function startDirectConversation(otherUserId: string) {
  const { data, error } = await bilt.rpc('start_direct_conversation', {
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string, before?: string) {
  let query = bilt
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
  const { data, error } = await bilt
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
  const { error } = await bilt
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
  const channel = bilt
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: MessageInsertPayload) => onMessage(payload.new),
    )
    .subscribe();

  return () => {
    void bilt.removeChannel(channel);
  };
}
