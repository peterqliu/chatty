import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageList from '../components/MessageList';

function DirectMessage({ messages, loading, userId, setMessages, setParentMessage, users }) {
  const [newMessage, setNewMessage] = useState('');
  // const [otherUser, setOtherUser] = useState(null);
  const { token } = useAuth();

  const otherUser = users.find(user => user.id === userId);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:2222/api/messages/dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(userId),
          text: newMessage
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      // Map the new message to match the format expected by MessageList
      const mappedMessage = {
        ...data,
        userId: data.senderId
      };
      setMessages(prev => [...prev, mappedMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-white">
      <MessageList messages={messages} users={users} setMessages={setMessages} setParentMessage={setParentMessage}/>
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${otherUser?.name || 'loading...'}`}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-gray-500 focus:ring-0"
          />
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default DirectMessage;
