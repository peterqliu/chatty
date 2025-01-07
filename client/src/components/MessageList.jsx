import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MessageList({ messages, fetchUserData }) {
  const [users, setUsers] = useState({});
  const { token } = useAuth();

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
              <div key={message.id} className="group hover:bg-gray-50 px-4 py-1 -mx-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={getProfileImage(message.userId)}
                      alt={users[message.userId]?.name || 'User'}
                      className="w-9 h-9 rounded object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${
                          encodeURIComponent((users[message.userId]?.name || 'U').charAt(0))
                        }&background=random`;
                      }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
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
                    <p className="text-gray-900 whitespace-pre-wrap">{message.text}</p>
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