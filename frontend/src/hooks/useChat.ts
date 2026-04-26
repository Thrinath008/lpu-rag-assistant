import { useState, useCallback } from 'react';
import { chatApi } from '../lib/api';
import { ChatMessage } from '../lib/types';
import { toast } from 'sonner';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse UUID statelessly
  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_session_id');
    }
    return null;
  };

  const saveSessionId = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_session_id', id);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const currentSessionId = getSessionId();
      const response = await chatApi.ask(content, currentSessionId);
      
      // Cache session natively
      if (response.session_id) {
        saveSessionId(response.session_id);
      }

      const answer = response.answer?.trim() || 'No response received from assistant.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: response.sources || [],
        confidence: response.confidence
      }]);

      toast.success("Response complete");
    } catch (err: any) {
      const errorChatMessage = err.message || "Failed to get an answer from the assistant.";
      setError(errorChatMessage);
      toast.error(errorChatMessage);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${errorChatMessage}. Please try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
