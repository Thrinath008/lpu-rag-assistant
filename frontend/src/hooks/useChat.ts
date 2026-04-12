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

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantChatMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      sources: [],
    };

    setMessages(prev => [...prev, assistantChatMessage]);

    try {
      const response = await chatApi.askStream(content);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to connect to the assistant.");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Handle potential multiple JSON objects in one chunk
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'sources') {
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, sources: data.content } : m
              ));
            } else if (data.type === 'content') {
              assistantContent += data.content;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, content: assistantContent } : m
              ));
            } else if (data.type === 'error') {
              throw new Error(data.content);
            }
          } catch (e) {
            console.warn("Error parsing stream chunk:", e);
          }
        }
      }
      
      toast.success("Response complete");
    } catch (err: any) {
      const errorChatMessage = err.message || "Failed to get an answer from the assistant.";
      setError(errorChatMessage);
      toast.error(errorChatMessage);
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: `❌ Error: ${errorChatMessage}. Please try again.` } 
          : m
      ));
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
