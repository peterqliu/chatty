import React, { createContext, useContext, useState } from 'react';

// Create the context
const ChatContext = createContext();

// Initial dummy data
const INITIAL_USERS = [
  { id: '1', name: 'Alice', status: 'online' },
  { id: '2', name: 'Bob', status: 'offline' },
  { id: '3', name: 'Charlie', status: 'online' },
];

const INITIAL_CHANNELS = [
  { id: '1', name: 'general', description: 'General discussion' },
  { id: '2', name: 'random', description: 'Random stuff' },
];

const INITIAL_MESSAGES = [
  { 
    id: '1', 
    content: 'Hello everyone!', 
    senderId: '1', 
    channelId: '1',
    timestamp: new Date('2024-01-01T10:00:00'),
  },
  { 
    id: '2', 
    content: 'Hey Alice!', 
    senderId: '2', 
    channelId: '1',
    timestamp: new Date('2024-01-01T10:01:00'),
  },
];

// Create the provider
export function ChatProvider({ children }) {
  const [users] = useState(INITIAL_USERS);
  const [channels] = useState(INITIAL_CHANNELS);
  const [messages] = useState(INITIAL_MESSAGES);

  // Search function
  const searchMessages = (query) => {
    return messages
      .filter(message => 
        message.content.toLowerCase().includes(query.toLowerCase())
      )
      .map(message => ({
        ...message,
        channelName: channels.find(c => c.id === message.channelId)?.name,
        senderName: users.find(u => u.id === message.senderId)?.name
      }));
  };

  const value = {
    users,
    channels,
    messages,
    searchMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Create the hook
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 