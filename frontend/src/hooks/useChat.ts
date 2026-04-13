import { useState, useCallback } from 'react';
import { chatApi } from '../lib/api';
import { ChatMessage } from '../lib/types';
import { toast } from 'sonner';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Extract conversation history to send to backend (limit to last 10 messages for context window)
    const historyPayload = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await chatApi.ask(content, historyPayload);
      const answer = response.answer?.trim() || 'No response received from assistant.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: response.sources || []
      }]);

      if (response.integrity === 'error') {
        setError(answer);
        toast.error(answer);
      } else {
        toast.success("Response complete");
      }
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
