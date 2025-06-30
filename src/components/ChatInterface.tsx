'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';

interface ChatInterfaceProps {
  baseDirectory?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export default function ChatInterface({ baseDirectory }: ChatInterfaceProps) {
  const {
    completion,
    input,
    isLoading,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    setInput,
  } = useCompletion({
    api: '/api/completion',
    body: {
      baseDirectory: baseDirectory,
    },
    onFinish: (prompt, completion) => {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = completion;
          lastMessage.id = `assistant-${Date.now()}`;
        }
        return newMessages;
      });
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    originalHandleSubmit(e);
  };

  useEffect(() => {
    if (completion) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: completion,
          };
          return newMessages;
        });
      } else {
        const assistantMessage: Message = {
          id: `assistant-streaming-${Date.now()}`,
          role: 'assistant',
          content: completion,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    }
  }, [completion]);

  const formatTimestamp = (date?: Date) => {
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const suggestedPrompts = [
    "List all files in the current directory",
    "Create a new file called 'hello.txt' with the content 'Hello, World!'",
    "Read the contents of package.json",
    "Create a simple HTML file with a basic structure",
    "Delete any temporary files",
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col min-h-screen mx-auto">

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No messages yet. Try one of these suggestions:
            </div>
            <div className="grid gap-2 max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 opacity-70 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatTimestamp(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
           <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <div className="whitespace-pre-wrap">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your file operation request..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 