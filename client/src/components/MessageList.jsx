import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageReactions from './MessageReactions';
import UserAvatar from './UserAvatar';
import Message from './Message';

function MessageList({ messages, setParentMessage, users, isThreadView = false, placeholder }) {
    const [activeReactionMessage, setActiveReactionMessage] = useState(null);
    const { token, userId } = useAuth();
  
  const getProfileImage = (userId) => {
    const user = users[userId];
    if (user?.photo) {
      return `http://localhost:2222${user.photo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`;
  };

  const groupMessagesByDate = (messages) => {
    if (!messages) return {};
    
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
      {messages.length === 0 && placeholder ? (
        <div className="text-center text-gray-500 mt-4">
         {placeholder ||` No messages yet. Start the conversation!`}
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
              <Message
                key={message.id}
                message={message}
                user={users[message.userId-1]}
                setParentMessage={setParentMessage}
                activeReactionMessage={activeReactionMessage}
                setActiveReactionMessage={setActiveReactionMessage}
                token={token}
                isThreadView={isThreadView}
              />
            ))}
          </div>
        ))
      )}

    </div>
  );
}

export default MessageList; 