import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '../lib/api';
import { ChatMessage } from '../lib/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'lpu_chat_messages';
const SESSION_KEY = 'lpu_chat_session_id';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
  }, []);

  // Save to local storage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SESSION_KEY);
    }
    return null;
  };

  const saveSessionId = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, id);
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    toast.success("New thread started");
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};

