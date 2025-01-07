import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageList from '../components/MessageList';

function DirectMessage() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token && userId) {
      fetchMessages();
      fetchOtherUser();
    }
  }, [userId, token]);

  const fetchOtherUser = async () => {
    try {
      const response = await fetch(`http://localhost:2222/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      setOtherUser(data);
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:2222/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:2222/api/messages/dm/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();

      // First fetch the recipient's user data
      const userResponse = await fetch(`http://localhost:2222/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch recipient data');
      const recipientData = await userResponse.json();
      
      // Map messages and include recipient data
      const mappedMessages = data.map(message => ({
        ...message,
        userId: message.senderId,
        recipientName: recipientData.name,
        recipientId: parseInt(userId)
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <MessageList messages={messages} fetchUserData={fetchUserData} />
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
