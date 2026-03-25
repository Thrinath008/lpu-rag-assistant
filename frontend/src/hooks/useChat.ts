import { useState, useCallback } from 'react';
import { chatApi } from '../lib/api';
import { ChatMessage, ChatResponse } from '../lib/types';
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

    try {
      const response = await chatApi.ask(content);
      
      const assistantChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantChatMessage]);
      toast.success("Response received from LPU knowledge base");
    } catch (err: any) {
      const errorChatMessage = err.response?.data?.detail || "Failed to get an answer from the assistant.";
      setError(errorChatMessage);
      toast.error(errorChatMessage);
      
      // Add a system error message to the thread
      const systemError: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${errorChatMessage}. Please try again.`,
      };
      setMessages(prev => [...prev, systemError]);
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
