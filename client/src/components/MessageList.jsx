import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageReactions from './MessageReactions';
import UserAvatar from './UserAvatar';

function MessageList({ messages, setMessages, fetchUserData }) {
    const [users, setUsers] = useState({});
    const [activeReactionMessage, setActiveReactionMessage] = useState(null);
    const { token, userId } = useAuth();
  
    const handleReaction = async (messageId, emoji) => {
      try {
        // Toggle the reaction and wait for it to complete
        const toggleResponse = await fetch('http://localhost:2222/api/toggleReaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            messageId,
            emoji
          })
        });

        if (!toggleResponse.ok) {
          throw new Error('Failed to toggle reaction');
        }

        // Wait for the toggle response to be processed
        const newMessage = await toggleResponse.json();


        
        // Update just the reactions for this message
        const updatedMessages = messages.map(msg => 
          msg.id === messageId  ? newMessage : msg);
        
        setMessages(updatedMessages)
      } catch (error) {
        console.error('Error handling reaction:', error);
      }
      
      setActiveReactionMessage(null);
    };
    
  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueUserIds = [...new Set(messages.map(m => m.userId))];
      await Promise.all(uniqueUserIds.map(async (userId) => {
        if (!users[userId]) {
          const userData = await fetchUserData(userId);
          setUsers(prev => ({ ...prev, [userId]: userData }));
        }
      }));
    };

    if (token) {
      fetchUsers();
    }
  }, [messages, token, fetchUserData, users]);

  const getProfileImage = (userId) => {
    const user = users[userId];
    if (user?.photo) {
      return `http://localhost:2222${user.photo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`;
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">
          No messages yet. Start the conversation!
        </div>
      ) : (
        Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center mb-4">
              <div className="border-t border-gray-300 flex-grow"></div>
              <div className="mx-4 text-xs text-gray-500 font-medium">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            {dateMessages.map((message) => (
              <div key={message.id} className="group hover:bg-gray-50 px-4 py-2 -mx-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <UserAvatar user={users[message.userId]} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">
                          {users[message.userId]?.name || `User ${message.userId}`}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <button 
                          className="text-gray-400 hover:text-gray-600 text-sm"
                          onClick={() => setActiveReactionMessage(activeReactionMessage === message.id ? null : message.id)}
                        >
                          <span>:)</span>
                        </button>
                        
                        {activeReactionMessage === message.id && (
                          <div className="absolute bottom-full right-0 mb-1 bg-white shadow-lg rounded-lg border p-2 flex space-x-2 z-10">
                            <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'heart')}>❤️</button>
                            <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'thumbsUp')}>👍</button>
                            <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'thumbsDown')}>👎</button>
                            <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'smile')}>😊</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-900 font-light whitespace-pre-wrap text-base">{message.text}</p>
                    <MessageReactions 
                        message={message} 
                        onReaction={handleReaction} 
                    />
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default MessageList; 