import { base } from './config';
import { handleServiceError } from '../../utils/error';
import type { Conversation, Message } from '../../types';

const parseMessages = (rawMessages: any): Message[] => {
  try {
    if (!rawMessages) return [];
    return typeof rawMessages === 'string' ? JSON.parse(rawMessages) : rawMessages;
  } catch (error) {
    console.warn('Failed to parse messages:', error);
    return [];
  }
};

const mapAirtableToConversation = (record: any): Conversation => {
  const propertyIds = record.get('Properties');
  return {
    id: record.id,
    propertyId: Array.isArray(propertyIds) ? propertyIds[0] : propertyIds,
    guestName: record.get('Guest Name') || '',
    checkIn: record.get('Check-in Date') || '',
    checkOut: record.get('Check-out Date') || '',
    messages: parseMessages(record.get('Messages'))
  };
};

export const conversationService = {
  async fetchConversationById(conversationId: string): Promise<Conversation> {
    try {
      if (!base) throw new Error('Airtable is not configured');
      if (!conversationId) throw new Error('Conversation ID is required');

      console.log('Fetching conversation:', conversationId);
      const record = await base('Conversations').find(conversationId);
      
      if (!record) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      return mapAirtableToConversation(record);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  async fetchPropertyConversations(propertyId: string): Promise<Conversation[]> {
    try {
      if (!base) throw new Error('Airtable is not configured');
      if (!propertyId) throw new Error('Property ID is required');

      console.log('Fetching conversations for property:', propertyId);
      const records = await base('Conversations')
        .select({
          filterByFormula: `SEARCH("${propertyId}", {Properties})`,
          fields: [
            'Properties',
            'Guest Name',
            'Messages',
            'Check-in Date',
            'Check-out Date'
          ],
        })
        .all();

      return records.map(mapAirtableToConversation);
    } catch (error) {
      console.error('Error fetching property conversations:', error);
      throw error;
    }
  },

  async updateConversation(
    conversationId: string, 
    data: { Messages?: string }
  ): Promise<Conversation> {
    try {
      if (!base) throw new Error('Airtable is not configured');
      if (!conversationId) throw new Error('Conversation ID is required');

      console.log('Updating conversation:', conversationId);
      const updatedRecord = await base('Conversations').update(conversationId, data);
      return mapAirtableToConversation(updatedRecord);
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }
};